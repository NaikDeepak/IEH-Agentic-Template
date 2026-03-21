import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { FocusTrap } from 'focus-trap-react';
import { toast } from 'sonner';
import * as Sentry from '@sentry/react';
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
                    Sentry.captureException(err);
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
            toast.success('Application submitted! We\'ll notify you of updates.');
        } catch (err) {
            Sentry.captureException(err);
            console.error("Submission failed:", err);
            const msg = "Failed to submit application. Please try again.";
            setError(msg);
            toast.error(msg);
            setStep('questions');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnswerChange = (question: string, value: string) => {
        setAnswers(prev => ({ ...prev, [question]: value }));
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            role="presentation"
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        >
            <FocusTrap active={isOpen}>
                <div
                    className="bg-white rounded-2xl border border-slate-200 shadow-soft-md w-full max-w-2xl flex flex-col max-h-[90vh]"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="apply-modal-title"
                    tabIndex={-1}
                >
                    {/* Header */}
                    <div className="border-b border-slate-200 px-6 py-5 flex justify-between items-center">
                        <div>
                            <h2 id="apply-modal-title" className="text-lg font-bold text-slate-900">Apply for Role</h2>
                            <p className="text-sm text-slate-400 mt-0.5">{job.title}</p>
                        </div>
                        <button
                            onClick={() => { onClose(); }}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-6">
                        {checkingStatus ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-slate-400">Checking application status...</p>
                            </div>
                        ) : hasApplied ? (
                            <div className="text-center py-10">
                                <div className="w-14 h-14 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-center mx-auto mb-5">
                                    <AlertCircle className="w-7 h-7 text-sky-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Already Applied</h3>
                                <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                    You've already submitted an application for this position. Track your progress in the dashboard.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => { onClose(); }}
                                        className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => { window.location.href = '/seeker/tracker'; }}
                                        className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors"
                                    >
                                        View Tracker
                                    </button>
                                </div>
                            </div>
                        ) : step === 'questions' ? (
                            <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
                                {job.screening_questions && job.screening_questions.length > 0 ? (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 mb-4">Screening Questions</h3>
                                        <div className="space-y-5">
                                            {job.screening_questions.map((q, idx) => (
                                                <div key={idx} className="space-y-1.5">
                                                    <label className="block text-sm font-medium text-slate-700">
                                                        {idx + 1}. {q.question}
                                                    </label>
                                                    {q.hint && (
                                                        <p className="text-xs text-slate-400">{q.hint}</p>
                                                    )}
                                                    <textarea
                                                        required
                                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all min-h-[100px] resize-none"
                                                        placeholder="Your answer..."
                                                        value={answers[q.question] ?? ''}
                                                        onChange={e => { handleAnswerChange(q.question, e.target.value); }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                                        <p className="text-sm text-slate-500">
                                            No screening questions required.<br />
                                            <span className="font-medium text-slate-700">Ready to submit your profile?</span>
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-600 flex items-center gap-2.5">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { onClose(); }}
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !!(userData?.role && userData.role !== 'seeker')}
                                        className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Application'}
                                    </button>
                                </div>
                            </form>
                        ) : step === 'submitting' ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm font-medium text-slate-500">Submitting your application...</p>
                            </div>
                        ) : (
                            <div className="text-center py-10 flex flex-col items-center">
                                <div className="w-14 h-14 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center mb-5 animate-in zoom-in duration-300">
                                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Application Submitted</h3>
                                <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                                    Your profile and answers have been sent to the employer. You can track the status in your dashboard.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={() => { onClose(); }}
                                        className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors"
                                    >
                                        Done
                                    </button>
                                    <button
                                        onClick={() => { window.location.href = '/seeker/tracker'; }}
                                        className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        View Tracker
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </FocusTrap>
        </div>
    );
};
