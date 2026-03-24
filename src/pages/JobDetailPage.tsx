import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobService } from '../features/jobs/services/jobService';
import type { JobPosting } from '../features/jobs/types';
import { Header } from '../components/Header';
import { ApplyModal } from '../components/ApplyModal';
import { useAuth } from '../hooks/useAuth';
import { ApplicationService } from '../features/applications/services/applicationService';
import {
    Loader2,
    ArrowLeft,
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    Share2,
    Building2,
    Calendar,
    ChevronRight,
    Zap
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState<JobPosting | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [checkingApplication, setCheckingApplication] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            if (!id) return;
            // Jobs require authentication to read (Firestore rules)
            if (!user) {
                void navigate('/login', { state: { from: `/jobs/${id}` } });
                return;
            }
            try {
                setLoading(true);
                const data = await JobService.getJobById(id);
                if (data) {
                    setJob(data);
                } else {
                    setError("Job posting not found.");
                }
            } catch (err) {
                console.error("Error fetching job details:", err);
                setError("Failed to load job details.");
            } finally {
                setLoading(false);
            }
        };

        const checkApplicationStatus = async () => {
            if (!user || !id) return;
            try {
                setCheckingApplication(true);
                const applied = await ApplicationService.hasApplied(id, user.uid);
                setHasApplied(applied);
            } catch (err) {
                console.error("Error checking application status:", err);
            } finally {
                setCheckingApplication(false);
            }
        };

        void fetchJob();
        void checkApplicationStatus();
    }, [id, user, navigate]);

    const handleApply = () => {
        if (!user) {
            void navigate('/login', { state: { from: `/jobs/${id ?? ''}` } });
            return;
        }
        setIsApplyModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-sky-50">
                <Header />
                <div className="flex flex-col items-center justify-center py-32 gap-3">
                    <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-400">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-sky-50">
                <Header />
                <div className="container mx-auto px-4 py-24 text-center max-w-md">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Job Not Found</h1>
                    <p className="text-slate-500 text-sm mb-8">{error ?? "This listing has either expired or been removed."}</p>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                        Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    const formatSalary = () => {
        if (!job.salary_range) return 'Competitive';
        const { min, max, currency } = job.salary_range;
        return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    };

    return (
        <div className="min-h-screen bg-sky-50 font-sans">
            <Header />

            <main className="container mx-auto px-4 md:px-8 py-10 max-w-6xl">
                {/* Back */}
                <button
                    onClick={() => navigate('/jobs')}
                    className="group flex items-center gap-1.5 mb-8 text-sm text-slate-400 hover:text-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to jobs
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column */}
                    <div className="flex-grow lg:w-2/3 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-7">
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${job.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {job.status === 'active' ? 'Actively Hiring' : job.status}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                                {job.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                                </span>
                                {job.type && (
                                    <span className="flex items-center gap-1.5">
                                        <Briefcase className="w-4 h-4 text-slate-400" /> {job.type.replace('_', ' ')}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <DollarSign className="w-4 h-4 text-slate-400" /> {formatSalary()}
                                </span>
                                {job.work_mode && (
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-slate-400" /> {job.work_mode}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-7">
                            <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Job Description</h2>
                            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </div>

                        {/* Skills */}
                        {(job.skills?.length ?? 0) > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-7">
                                <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Required Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 text-xs font-medium text-sky-700 bg-sky-50 rounded-full border border-sky-100"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Company */}
                        {job.company_bio && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-7">
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                                    <div className="w-9 h-9 bg-sky-50 rounded-lg border border-sky-100 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-sky-600" />
                                    </div>
                                    <h2 className="text-base font-bold text-slate-900">About the Company</h2>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{job.company_bio}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:w-80 shrink-0">
                        <div className="sticky top-24 space-y-4">
                            {/* Apply Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                                {hasApplied ? (
                                    <button
                                        onClick={() => navigate('/seeker/tracker')}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors mb-3"
                                    >
                                        <Zap className="w-4 h-4" /> Track Application
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApply}
                                        disabled={checkingApplication}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors mb-3 disabled:opacity-50"
                                    >
                                        {checkingApplication ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>Apply Now <ChevronRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                )}
                                <p className="text-center text-xs text-slate-400">Powered by WorkMila</p>
                            </div>

                            {/* Info Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-400">Posted</p>
                                        <p className="text-sm font-semibold text-slate-700">Recently</p>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-slate-100">
                                    <button
                                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
                                        onClick={() => { void navigator.clipboard.writeText(window.location.href); }}
                                    >
                                        <Share2 className="w-4 h-4" /> Share Job
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <ApplyModal
                job={job}
                isOpen={isApplyModalOpen}
                onClose={() => { setIsApplyModalOpen(false); }}
            />
        </div>
    );
};
