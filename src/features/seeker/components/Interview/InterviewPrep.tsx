import React, { useState, useEffect } from 'react';
import { generateQuestions, evaluateAnswer, type InterviewQuestion, type EvaluationResult } from '../../services/interviewService';
import { ProfileService } from '../../services/profileService';
import { getLatestResume } from '../../services/resumeService';
import { useAuth } from '../../../../hooks/useAuth';
import { Loader2, Send, CheckCircle, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';

export const InterviewPrep: React.FC = () => {
    const { user } = useAuth();

    // State
    const [step, setStep] = useState<'setup' | 'practice' | 'summary'>('setup');
    const [role, setRole] = useState('');
    const [resumeContext, setResumeContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // S3-INTERVIEW-01: auto-fill role + context from profile/resume
    useEffect(() => {
        const prefill = async () => {
            if (!user) return;
            try {
                const [profile, resume] = await Promise.all([
                    ProfileService.getProfile(user.uid),
                    getLatestResume(user.uid)
                ]);
                // Prefill role from profile preferences
                const firstRole = profile?.preferences.roles[0];
                if (typeof firstRole === 'string' && firstRole.trim()) {
                    setRole(prev => prev || firstRole);
                }

                // Prefill context from latest resume
                const exp = resume?.parsed_data.experience ?? [];
                const skillsList = resume?.keywords.found ?? [];
                const skills = Array.isArray(skillsList) ? skillsList.slice(0, 10).join(', ') : '';

                if (exp.length > 0 || skills) {
                    const firstExp = exp[0];
                    const expContext = firstExp?.role && firstExp.company 
                        ? `Recent role: ${firstExp.role} at ${firstExp.company}` 
                        : '';
                    
                    const context = [
                        expContext,
                        skills ? `Key skills: ${skills}` : '',
                    ].filter(Boolean).join('\n');
                    setResumeContext(prev => prev || context);
                }
            } catch {
                // silently ignore — user can fill manually
            }
        };
        void prefill();
    }, [user]);

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const generatedQuestions = await generateQuestions(role, resumeContext);
            setQuestions(generatedQuestions);
            setStep('practice');
            setCurrentQuestionIndex(0);
            setAnswer('');
            setEvaluation(null);
        } catch (err) {
            setError('Failed to generate questions. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) return;

        setEvaluating(true);
        setError(null);
        try {
            const currentQuestion = questions[currentQuestionIndex];
            if (!currentQuestion) throw new Error('No question selected');
            const result = await evaluateAnswer(currentQuestion.question, answer, role);
            setEvaluation(result);
        } catch (err) {
            setError('Failed to evaluate answer. Please try again.');
            console.error(err);
        } finally {
            setEvaluating(false);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setAnswer('');
            setEvaluation(null);
        } else {
            setStep('summary');
        }
    };

    const resetSession = () => {
        setStep('setup');
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setAnswer('');
        setEvaluation(null);
        setError(null);
    };

    if (step === 'setup') {
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-soft p-8">
                <div className="mb-7 pb-5 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">AI Interview Prep</h2>
                    <p className="text-sm text-slate-400 mt-1">Generate practice questions tailored to your target role</p>
                </div>

                <form onSubmit={handleStart} className="space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="target-role" className="block text-xs font-medium text-slate-500 uppercase tracking-widest">
                            Target Role
                        </label>
                        <input
                            id="target-role"
                            type="text"
                            value={role}
                            onChange={(e) => { setRole(e.target.value); }}
                            placeholder="e.g. Senior Frontend Developer"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="resume-context" className="block text-xs font-medium text-slate-500 uppercase tracking-widest">
                            Resume Context <span className="text-slate-300 normal-case font-normal">(optional)</span>
                        </label>
                        <textarea
                            id="resume-context"
                            value={resumeContext}
                            onChange={(e) => { setResumeContext(e.target.value); }}
                            placeholder="Paste your resume summary or key experiences to get personalized questions..."
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all text-sm text-slate-900 placeholder:text-slate-400 h-36 resize-none"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !role.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating questions...
                            </>
                        ) : (
                            <>
                                Start Practice
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        );
    }

    if (step === 'summary') {
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-soft p-10 text-center animate-in zoom-in duration-300">
                <div className="w-14 h-14 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Practice Complete</h2>
                <p className="text-sm text-slate-500 mb-8">
                    You completed {questions.length} questions for <span className="font-semibold text-slate-700">{role}</span>.
                </p>
                <button
                    onClick={resetSession}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Start New Session
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            {/* Session Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft px-6 py-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-400 mb-0.5">Practising for</p>
                    <h2 className="text-base font-bold text-slate-900">{role}</h2>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">
                        Question <span className="font-semibold text-slate-700">{currentQuestionIndex + 1}</span> / {questions.length}
                    </span>
                    <button
                        onClick={resetSession}
                        className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        End Session
                    </button>
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-7">
                <div className="flex items-center justify-between mb-5">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full
                        ${currentQuestion.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                            currentQuestion.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'}`}>
                        {currentQuestion.difficulty}
                    </span>
                    <span className="text-xs text-slate-400">{currentQuestion.type}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                    {currentQuestion.question}
                </h3>
            </div>

            {/* Answer / Evaluation */}
            {!evaluation ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-7">
                    <label htmlFor="answer-input" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                        Your Answer
                    </label>
                    <textarea
                        id="answer-input"
                        value={answer}
                        onChange={(e) => { setAnswer(e.target.value); }}
                        placeholder="Type your answer here..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all text-sm text-slate-900 placeholder:text-slate-400 h-44 resize-none mb-5"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={evaluating || !answer.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {evaluating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Evaluating...
                                </>
                            ) : (
                                <>
                                    Submit Answer
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Your Answer */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Your Answer</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed italic border-l-2 border-slate-300 pl-4">{answer}</p>
                    </div>

                    {/* Score + Feedback */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
                        {/* Score header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900">AI Feedback</h4>
                            <span className={`px-3 py-1 text-sm font-bold rounded-full
                                ${evaluation.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                    evaluation.score >= 60 ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'}`}>
                                {evaluation.score}%
                            </span>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Strengths & Weaknesses */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5">
                                    <h5 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Strengths
                                    </h5>
                                    <ul className="space-y-2">
                                        {evaluation.strengths.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                <span className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-red-50 rounded-xl border border-red-100 p-5">
                                    <h5 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Areas to Improve
                                    </h5>
                                    <ul className="space-y-2">
                                        {evaluation.weaknesses.map((w, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                <span className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                                {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Suggestion */}
                            <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
                                <p className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-2">Tip</p>
                                <p className="text-sm text-amber-900 leading-relaxed">{evaluation.suggestion}</p>
                            </div>

                            {/* Model Answer */}
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Model Answer</p>
                                <div className="bg-slate-900 text-slate-100 rounded-xl p-5 text-sm leading-relaxed italic">
                                    {evaluation.betterAnswer}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={handleNextQuestion}
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors"
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Session'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
