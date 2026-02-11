import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { generateAssessment, submitAssessment } from '../../services/assessmentService';
import type { Assessment, AssessmentResult } from '../../types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Loader2, CheckCircle, XCircle, Award, ArrowRight, BrainCircuit, AlertCircle } from 'lucide-react';

export const SkillProofs: React.FC = () => {
    const { user } = useAuth();
    const [skills, setSkills] = useState<string[]>([]);
    const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<AssessmentResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSkills((data.skills as string[] | undefined) ?? []);
                    setVerifiedSkills((data.verified_skills as string[] | undefined) ?? []);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        };

        void fetchUserData();
    }, [user]);

    const handleStartAssessment = async (skill: string) => {
        setSelectedSkill(skill);
        setIsGenerating(true);
        setError(null);
        setResult(null);
        setAnswers({});

        try {
            const assessment = await generateAssessment(skill);
            setCurrentAssessment(assessment);
        } catch (err) {
            console.error(err);
            setError("Failed to generate assessment. Please try again.");
            setSelectedSkill(null);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnswerChange = (questionId: string, optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        if (!user || !selectedSkill || !currentAssessment) return;

        // Ensure all questions are answered
        if (Object.keys(answers).length < currentAssessment.questions.length) {
            setError("Please answer all questions before submitting.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const assessmentResult = await submitAssessment(
                user.uid,
                selectedSkill,
                currentAssessment,
                answers
            );
            setResult(assessmentResult);

            if (assessmentResult.passed) {
                setVerifiedSkills(prev => [...prev, selectedSkill]);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to submit assessment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetAssessment = () => {
        setSelectedSkill(null);
        setCurrentAssessment(null);
        setAnswers({});
        setResult(null);
        setError(null);
    };

    // View: Loading (Generating)
    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200">
                <Loader2 size={48} className="animate-spin text-indigo-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Generating Assessment</h3>
                <p className="text-slate-600 mt-2">Our AI is crafting unique questions to test your {selectedSkill} knowledge...</p>
            </div>
        );
    }

    // View: Assessment Result
    if (result) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-2xl mx-auto">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {result.passed ? <Award size={40} /> : <XCircle size={40} />}
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {result.passed ? 'Skill Verified!' : 'Assessment Failed'}
                </h2>

                <div className="text-4xl font-black text-slate-900 mb-4">
                    {result.score}%
                </div>

                <p className="text-slate-600 mb-8 text-lg">
                    {result.feedback}
                </p>

                <button
                    onClick={resetAssessment}
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Back to Skills
                </button>
            </div>
        );
    }

    // View: Taking Assessment
    if (currentAssessment) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900">
                        Verify: <span className="text-indigo-600">{currentAssessment.skill}</span>
                    </h2>
                    <button onClick={resetAssessment} className="text-slate-500 hover:text-slate-700">
                        Cancel
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6 flex items-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="space-y-8">
                    {currentAssessment.questions.map((q, idx) => (
                        <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-medium text-slate-900 mb-4">
                                <span className="text-slate-400 mr-2">{idx + 1}.</span>
                                {q.text}
                            </h3>
                            <div className="space-y-3">
                                {q.options.map((option, optIdx) => (
                                    <label
                                        key={optIdx}
                                        className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                                            answers[q.id] === optIdx
                                                ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                                                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            value={optIdx}
                                            checked={answers[q.id] === optIdx}
                                            onChange={() => { handleAnswerChange(q.id, optIdx); }}
                                            className="mt-1 mr-3 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-slate-700">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit Assessment
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // View: Skill List (Default)
    const unverifiedSkills = skills.filter(s => !verifiedSkills.includes(s));

    return (
        <div className="max-w-5xl mx-auto p-6">
             <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-3 flex items-center justify-center gap-3">
                    <BrainCircuit size={32} className="text-indigo-600" />
                    Verified Skill Proofs
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    Stand out to employers by verifying your expertise with AI-generated assessments.
                    Earn badges to prove your proficiency.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Unverified Skills */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <TargetIcon className="text-slate-400" />
                        Available for Verification
                    </h3>

                    {unverifiedSkills.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            {skills.length === 0
                                ? "Add skills to your profile to take assessments."
                                : "All your skills are verified! Great job!"}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {unverifiedSkills.map(skill => (
                                <div key={skill} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-200">
                                    <span className="font-medium text-slate-700">{skill}</span>
                                    <button
                                        onClick={() => handleStartAssessment(skill)}
                                        className="px-4 py-2 bg-white text-indigo-600 text-sm font-medium border border-indigo-200 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                                    >
                                        Verify
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Verified Skills */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Award className="text-amber-500" />
                        Verified Badges
                    </h3>

                    {verifiedSkills.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            No verified skills yet. Take an assessment to earn your first badge!
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {verifiedSkills.map(skill => (
                                <div key={skill} className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg border border-green-100">
                                    <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                                    <span className="font-medium truncate" title={skill}>{skill}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper component since Lucide's Target might conflict or I want a specific style
const TargetIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);
