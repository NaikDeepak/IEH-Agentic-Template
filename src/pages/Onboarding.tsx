import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Sparkles, Target, Building2, ArrowRight, CheckCircle, Loader2, SkipForward
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

type SeekerStep = 'welcome' | 'cv' | 'target-role' | 'done';
type EmployerStep = 'welcome' | 'company' | 'done';

const SEEKER_STEPS: SeekerStep[] = ['welcome', 'cv', 'target-role', 'done'];
const EMPLOYER_STEPS: EmployerStep[] = ['welcome', 'company', 'done'];

export const Onboarding: React.FC = () => {
    const { user, userData, completeOnboarding } = useAuth();
    const navigate = useNavigate();
    const isEmployer = userData?.role === 'employer';

    const [step, setStep] = useState<SeekerStep | EmployerStep>('welcome');
    const [targetRole, setTargetRole] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [finishError, setFinishError] = useState<string | null>(null);

    const steps = isEmployer ? EMPLOYER_STEPS : SEEKER_STEPS;
    const currentIndex = steps.indexOf(step as never);
    const firstName = user?.displayName?.split(' ')[0] ?? 'there';

    const finish = async (extra: Record<string, string> = {}) => {
        setIsSaving(true);
        setFinishError(null);
        try {
            await completeOnboarding(extra);
            void navigate(isEmployer ? '/employer/jobs' : '/seeker/dashboard');
        } catch (err) {
            console.error('Failed to complete onboarding:', err);
            setFinishError('Failed to save your profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const next = (s: SeekerStep | EmployerStep) => { setStep(s); };

    // ── Progress bar ──────────────────────────────────────────────────
    const ProgressBar = () => (
        <div className="flex items-center gap-2 mb-8">
            {steps.filter(s => s !== 'done').map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`h-1.5 flex-1 rounded-full transition-all ${i <= currentIndex - 1 || (currentIndex >= steps.length - 1) ? 'bg-sky-600' : i === currentIndex ? 'bg-sky-300' : 'bg-slate-100'}`} />
                </div>
            ))}
        </div>
    );

    // ── SEEKER: Welcome ───────────────────────────────────────────────
    if (!isEmployer && step === 'welcome') {
        return (
            <div className="max-w-xl mx-auto px-4 py-16">
                <ProgressBar />
                <div className="text-center space-y-4 mb-10">
                    <div className="w-16 h-16 bg-sky-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-2xl">
                        👋
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome, {firstName}!</h1>
                    <p className="text-slate-400 text-sm">
                        Let's set up your profile in 2 quick steps so you can start finding great opportunities.
                    </p>
                </div>
                <button
                    onClick={() => { next('cv'); }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors"
                >
                    Get started <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // ── SEEKER: CV ────────────────────────────────────────────────────
    if (!isEmployer && step === 'cv') {
        return (
            <div className="max-w-xl mx-auto px-4 py-16">
                <ProgressBar />
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Add your CV</h2>
                    <p className="text-sm text-slate-400">
                        Your CV powers AI analysis, skill gap detection, and job matching.
                    </p>
                </div>

                <div className="space-y-3 mb-6">
                    <button
                        onClick={() => void navigate('/seeker/resume?from=onboarding')}
                        className="w-full flex items-start gap-4 p-5 bg-white border-2 border-sky-500 rounded-xl hover:bg-sky-50 transition-colors text-left"
                    >
                        <div className="w-10 h-10 bg-sky-50 text-sky-700 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Upload my existing CV</p>
                            <p className="text-xs text-slate-400 mt-0.5">PDF — we'll analyse it instantly</p>
                        </div>
                    </button>

                    <button
                        onClick={() => void navigate('/seeker/resume?tab=builder&from=onboarding')}
                        className="w-full flex items-start gap-4 p-5 bg-white border-2 border-violet-400 rounded-xl hover:bg-violet-50 transition-colors text-left"
                    >
                        <div className="w-10 h-10 bg-violet-50 text-violet-700 rounded-lg flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Build my CV with AI</p>
                            <p className="text-xs text-slate-400 mt-0.5">Answer a few questions and AI writes it for you</p>
                        </div>
                    </button>
                </div>

                <button
                    onClick={() => { next('target-role'); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <SkipForward className="w-3.5 h-3.5" /> I'll add it later
                </button>
            </div>
        );
    }

    // ── SEEKER: Target role ───────────────────────────────────────────
    if (!isEmployer && step === 'target-role') {
        return (
            <div className="max-w-xl mx-auto px-4 py-16">
                <ProgressBar />
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">What's your target role?</h2>
                    <p className="text-sm text-slate-400">
                        This helps us match you with the right jobs and tailor skill gap analysis.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Target className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => { setTargetRole(e.target.value); }}
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                        />
                    </div>

                    {finishError && (
                        <p className="text-sm text-red-600">{finishError}</p>
                    )}

                    <button
                        onClick={() => void finish(targetRole.trim() ? { target_role: targetRole.trim() } : {})}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                {targetRole.trim() ? 'Save & go to dashboard' : 'Skip & go to dashboard'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // ── EMPLOYER: Welcome ─────────────────────────────────────────────
    if (isEmployer && step === 'welcome') {
        return (
            <div className="max-w-xl mx-auto px-4 py-16">
                <ProgressBar />
                <div className="text-center space-y-4 mb-10">
                    <div className="w-16 h-16 bg-sky-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-2xl">
                        🏢
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome, {firstName}!</h1>
                    <p className="text-slate-400 text-sm">
                        Let's set up your company profile so candidates know who they're applying to.
                    </p>
                </div>
                <button
                    onClick={() => { next('company'); }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors"
                >
                    Set up company <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // ── EMPLOYER: Company ─────────────────────────────────────────────
    if (isEmployer && step === 'company') {
        return (
            <div className="max-w-xl mx-auto px-4 py-16">
                <ProgressBar />
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Your company</h2>
                    <p className="text-sm text-slate-400">
                        You can complete your full company profile later from the dashboard.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => { setCompanyName(e.target.value); }}
                            placeholder="Company name"
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                        />
                    </div>

                    {finishError && (
                        <p className="text-sm text-red-600">{finishError}</p>
                    )}

                    <button
                        onClick={() => void finish(companyName.trim() ? { onboarding_company_name: companyName.trim() } : {})}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                {companyName.trim() ? 'Save & go to dashboard' : 'Skip & go to dashboard'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return null;
};
