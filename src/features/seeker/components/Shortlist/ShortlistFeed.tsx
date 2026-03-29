import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShortlistService, type ShortlistResult } from '../../services/shortlistService';
import type { JobPosting } from '../../../jobs/types';
import { Briefcase, MapPin, Building, Clock, ArrowRight, ArrowUpRight, Sparkles, Send } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { SkeletonShortlistCard } from '../../../../components/ui/Skeleton';
import { ApplyModal } from '../../../../components/ApplyModal';

interface ShortlistFeedProps {
    userId: string;
}

export const ShortlistFeed: React.FC<ShortlistFeedProps> = ({ userId }) => {
    const navigate = useNavigate();
    const [shortlist, setShortlist] = useState<ShortlistResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applyingJob, setApplyingJob] = useState<JobPosting | null>(null);

    const fetchShortlist = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await ShortlistService.getDailyShortlist(userId);
            setShortlist(result);
        } catch (err) {
            console.error("Failed to fetch shortlist:", err);
            setError("Failed to load your daily recommendations.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            void fetchShortlist();
        }
    }, [fetchShortlist, userId]);

    if (loading) {
        return (
            <div className="space-y-4" aria-busy="true" aria-label="Loading recommendations">
                {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonShortlistCard key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 text-center">
                <p className="text-slate-700 font-semibold mb-4">{error}</p>
                <button
                    onClick={() => { void fetchShortlist(); }}
                    className="bg-sky-700 text-white px-4 py-2 text-sm font-semibold rounded-xl hover:bg-sky-800 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Cold Start Handling
    if (shortlist?.isColdStart) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8 text-center">
                <div className="w-14 h-14 bg-sky-700 text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Unlock Your AI Feed</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                    Upload your resume to get 5 AI-curated job matches every day tailored to your skills.
                </p>
                <button
                    onClick={() => navigate('/seeker/resume')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-700 text-white text-sm font-semibold rounded-xl hover:bg-sky-800 transition-colors"
                >
                    Complete your profile
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        );
    }

    if (!shortlist || shortlist.jobs.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-10 text-center">
                <p className="text-slate-700 font-semibold mb-1">No recommendations today</p>
                <p className="text-sm text-slate-400">Check back tomorrow for fresh matches</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-200">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-sky-600" />
                        Daily Top 5
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Updated {shortlist.lastUpdated ? new Date(shortlist.lastUpdated).toLocaleDateString() : 'today'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Defensive deduplication of jobs to prevent duplicate keys */}
                {Array.from(new Map(shortlist.jobs.map(job => [job.id, job])).values()).map((job) => (
                    <ShortlistCard key={job.id} job={job} onApply={() => { setApplyingJob(job); }} />
                ))}
            </div>

            {applyingJob && (
                <ApplyModal
                    job={applyingJob}
                    isOpen={!!applyingJob}
                    onClose={() => { setApplyingJob(null); }}
                />
            )}
        </div>
    );
};

interface ShortlistCardProps {
    job: JobPosting & { matchScore: number; matchReason: string };
    onApply: () => void;
}

const ShortlistCard: React.FC<ShortlistCardProps> = ({ job, onApply }) => {
    const navigate = useNavigate();

    // Format salary if available
    const salaryString = job.salary_range
        ? `${job.salary_range.currency} ${job.salary_range.min.toLocaleString()} - ${job.salary_range.max.toLocaleString()}`
        : 'Salary not disclosed';

    const handleNavigate = () => {
        if (job.id) {
            void navigate(`/jobs/${job.id}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNavigate();
        }
    };

    // Helper to safely convert Firestore timestamp or date string to Date object
    const getJobDate = (dateField: unknown): Date => {
        if (!dateField) return new Date();
        if (dateField instanceof Timestamp) return dateField.toDate();

        // Handle unexpected object types that might have toDate
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const d = dateField as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (d && typeof d.toDate === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            return d.toDate() as Date;
        }

        return new Date(dateField as string | number | Date);
    };

    return (
        <div
            onClick={handleNavigate}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            className="group bg-white rounded-2xl border border-slate-200 shadow-soft p-5 flex flex-col gap-4 hover:shadow-soft-md hover:border-slate-300 transition-all cursor-pointer overflow-hidden"
        >
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Company Logo / Placeholder */}
                <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-xl bg-sky-50 border border-slate-200 flex items-center justify-center text-sky-700 font-bold text-lg">
                        {job.company_bio ? job.company_bio.substring(0, 1).toUpperCase() : <Building className="h-5 w-5" />}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-tight">
                            {job.title}
                        </h3>
                        <span className={`shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full ${job.matchScore >= 0.8 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {Math.round(job.matchScore * 100)}% match
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {job.company_bio?.split(' ')[0] ?? 'Company'}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location} · {job.work_mode}
                        </span>
                        <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {job.type.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>

            {/* AI Match Reason */}
            <div className="bg-sky-50 rounded-xl p-3.5 border border-sky-100 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-sky-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-600 leading-relaxed">{job.matchReason}</p>
            </div>

            {/* Footer Info */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 min-w-0">
                    <span className="font-medium text-slate-600 truncate">{salaryString}</span>
                    <span className="flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" />
                        {getJobDate(job.created_at).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onApply(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors"
                    >
                        <Send className="w-3 h-3" /> Apply
                    </button>
                    <div
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500"
                        role="img"
                        aria-label="View details"
                    >
                        View
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </div>
    );
};
