import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApplicationService } from '../features/applications/services/applicationService';
import { ProfileService } from '../features/seeker/services/profileService';
import { useAuth } from '../hooks/useAuth';
import type { JobPosting } from '../features/jobs/types';

interface ApplyModalProps {
    job: JobPosting;
    isOpen: boolean;
    onClose: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ job, isOpen, onClose }) => {
    const { user, userData } = useAuth();
    const [step, setStep] = useState<'questions' | 'submitting' | 'success'>('questions');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasApplied, setHasApplied] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [seekerHeadline, setSeekerHeadline] = useState<string>('');

    useEffect(() => {
        if (isOpen && user && job.id) {
            const loadData = async () => {
                setCheckingStatus(true);
                try {
                    if (!job.id) return;
                    const [applied, profile] = await Promise.all([
                        ApplicationService.hasApplied(job.id, user.uid),
                        ProfileService.getProfile(user.uid)
                    ]);
                    setHasApplied(applied);
                    if (profile?.headline) {
                        setSeekerHeadline(profile.headline);
                    }
                } catch (err) {
                    console.error("Error loading application status/profile:", err);
                } finally {
                    setCheckingStatus(false);
                }
            };
            void loadData();
        }
    }, [isOpen, user, job.id]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userData || !job.id) return;

        // Only block when role is known to be non-seeker.
        // If role is still loading/undefined, let the existing `!userData` guard handle it.
        if (userData.role && userData.role !== 'seeker') {
            setError("Only registered candidates can apply for jobs.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            setStep('submitting');

            await ApplicationService.submitApplication({
                job_id: job.id,
                employer_id: job.employer_id,
                candidate_id: user.uid,
                candidate_name: userData.displayName ?? user.email ?? 'Anonymous',
                candidate_role: seekerHeadline || 'Job Seeker',
                answers,
                match_score: 0, // AI match score placeholder
            });

            setStep('success');
        } catch (err) {
            console.error("Submission failed:", err);
            setError("Failed to submit application. Please try again.");
            setStep('questions');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnswerChange = (question: string, value: string) => {
        setAnswers(prev => ({ ...prev, [question]: value }));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black w-full max-w-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="border-b-4 border-black p-6 flex justify-between items-center bg-black text-white">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Apply for Role</h2>
                        <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mt-1">
                            {job.title}
                        </p>
                    </div>
                    <button
                        onClick={() => { onClose(); }}
                        className="p-2 hover:bg-white hover:text-black transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-8">
                    {checkingStatus ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-black" />
                            <p className="font-mono text-xs font-bold uppercase tracking-widest">Validating Status...</p>
                        </div>
                    ) : hasApplied ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 border-4 border-black bg-blue-50 mb-6">
                                <AlertCircle className="w-10 h-10 text-black" />
                            </div>
                            <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter">Already Applied</h3>
                            <p className="font-mono text-gray-500 uppercase tracking-tight text-sm mb-8 max-w-sm mx-auto">
                                You have already submitted an application for this position. Track your progress in the dashboard.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <button
                                    onClick={() => { onClose(); }}
                                    className="px-8 py-3 bg-white text-black border-2 border-black font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors"
                                >
                                    Close Window
                                </button>
                                <button
                                    onClick={() => { window.location.href = '/seeker/tracker'; }}
                                    className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                                >
                                    View Tracker
                                </button>
                            </div>
                        </div>
                    ) : step === 'questions' ? (
                        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-8">
                            {job.screening_questions && job.screening_questions.length > 0 ? (
                                <div>
                                    <h3 className="text-xl font-black uppercase mb-6 border-l-4 border-black pl-4">Screening Questions</h3>
                                    <div className="space-y-6">
                                        {job.screening_questions.map((q, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <label className="block text-sm font-black uppercase tracking-tight">
                                                    {q.question}
                                                </label>
                                                <textarea
                                                    required
                                                    className="w-full border-2 border-black p-4 font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors min-h-[100px]"
                                                    placeholder="Enter your response here..."
                                                    value={answers[q.question] ?? ''}
                                                    onChange={e => { handleAnswerChange(q.question, e.target.value); }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="font-mono text-sm font-bold uppercase tracking-widest text-gray-500">
                                        No screening questions required. <br /> Ready to submit your profile?
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border-2 border-red-600 p-4 font-mono text-xs text-red-600 flex items-center gap-3">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="pt-4 border-t-2 border-dashed border-gray-200 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => { onClose(); }}
                                    className="px-6 py-3 font-bold uppercase tracking-widest text-xs border-2 border-black hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || userData?.role !== 'seeker'}
                                    className="px-10 py-3 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Submission'}
                                </button>
                            </div>
                        </form>
                    ) : step === 'submitting' ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-16 h-16 animate-spin text-black" />
                            <p className="font-black uppercase tracking-[0.2em] text-xl">Processing Application</p>
                        </div>
                    ) : (
                        <div className="text-center py-12 flex flex-col items-center">
                            <div className="w-24 h-24 bg-green-50 border-4 border-black flex items-center justify-center mb-8 animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-12 h-12 text-black" />
                            </div>
                            <h3 className="text-4xl font-black uppercase mb-4 tracking-tighter leading-none">Application Sent</h3>
                            <p className="font-mono text-gray-500 uppercase tracking-tight text-sm mb-12 max-w-md mx-auto">
                                Your profile and answers have been successfully transmitted to the employer. You can monitor the status on your tracker.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <button
                                    onClick={() => { onClose(); }}
                                    className="px-8 py-3 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors"
                                >
                                    Done
                                </button>
                                <button
                                    onClick={() => { window.location.href = '/seeker/tracker'; }}
                                    className="px-8 py-3 border-2 border-black text-black font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors"
                                >
                                    View Tracker
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
