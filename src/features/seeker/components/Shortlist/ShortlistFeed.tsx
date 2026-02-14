import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShortlistService, type ShortlistResult } from '../../services/shortlistService';
import type { JobPosting } from '../../../jobs/types';
import { Briefcase, MapPin, Building, Clock, ArrowRight, ArrowUpRight, Loader2, Sparkles } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

interface ShortlistFeedProps {
    userId: string;
}

export const ShortlistFeed: React.FC<ShortlistFeedProps> = ({ userId }) => {
    const navigate = useNavigate();
    const [shortlist, setShortlist] = useState<ShortlistResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShortlist = async () => {
            try {
                setLoading(true);
                const result = await ShortlistService.getDailyShortlist(userId);
                setShortlist(result);
            } catch (err) {
                console.error("Failed to fetch shortlist:", err);
                setError("Failed to load your daily recommendations.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            void fetchShortlist();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Loader2 className="h-8 w-8 text-black animate-spin mb-4" />
                <p className="text-sm font-mono uppercase font-bold tracking-widest">Curating your daily feed...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                <p className="text-black font-bold mb-4 uppercase tracking-tight">{error}</p>
                <button
                    onClick={() => { window.location.reload(); }}
                    className="bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Cold Start Handling
    if (shortlist?.isColdStart) {
        return (
            <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 -z-10"></div>

                {shortlist.error && (
                    <div className="mb-6 p-3 bg-white border-2 border-black text-black text-xs font-mono font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        DEBUG ERR: {shortlist.error}
                    </div>
                )}

                <div className="inline-flex items-center justify-center p-4 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] mb-8">
                    <Sparkles className="h-8 w-8 text-yellow-400" />
                </div>

                <h3 className="text-3xl font-black uppercase tracking-tighter text-black mb-4">
                    Unlock Your AI Feed
                </h3>

                <p className="text-gray-600 font-medium max-w-md mx-auto mb-10 leading-relaxed border-l-4 border-black pl-6">
                    We can't recommend jobs yet because we don't know your skills.
                    Upload your resume to get 5 curated job matches every day.
                </p>

                <button
                    onClick={() => navigate('/seeker/resume')}
                    className="inline-flex items-center px-8 py-4 bg-black text-white text-sm font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
                >
                    Complete your profile
                    <ArrowRight className="ml-2 h-5 w-5" />
                </button>
            </div>
        );
    }

    if (!shortlist || shortlist.jobs.length === 0) {
        return (
            <div className="bg-white p-12 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 -z-10"></div>
                <p className="text-black font-black uppercase tracking-tighter text-xl mb-2">No recommendations today</p>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Check back tomorrow for fresh matches</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-8">
                <div>
                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                        Daily Top 5
                    </h2>
                    <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mt-1">
                        UPDATED {shortlist.lastUpdated ? new Date(shortlist.lastUpdated).toLocaleDateString().toUpperCase() : 'TODAY'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Defensive deduplication of jobs to prevent duplicate keys */}
                {Array.from(new Map(shortlist.jobs.map(job => [job.id, job])).values()).map((job) => (
                    <ShortlistCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    );
};

interface ShortlistCardProps {
    job: JobPosting & { matchScore: number; matchReason: string };
}

const ShortlistCard: React.FC<ShortlistCardProps> = ({ job }) => {
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
            className="group relative bg-white border-2 border-black p-6 flex flex-col gap-6 transition-all duration-200 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer overflow-hidden"
        >
            {/* Match Score Badge */}
            <div className={`absolute top-0 right-0 px-4 py-2 border-b-2 border-l-2 border-black font-mono font-black uppercase text-xs tracking-widest transition-colors ${job.matchScore >= 0.8 ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
                {Math.round(job.matchScore * 100)}% Match
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                {/* Company Logo / Placeholder */}
                <div className="flex-shrink-0">
                    <div className="h-16 w-16 border-2 border-black bg-white flex items-center justify-center text-black font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-yellow-400 transition-colors">
                        {job.company_bio ? job.company_bio.substring(0, 1).toUpperCase() : <Building className="h-8 w-8" />}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500">Active Hiring</span>
                        </div>
                        <h3 className="text-2xl font-black text-black uppercase tracking-tighter group-hover:text-[#003366] transition-colors leading-none mb-2">
                            {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
                            <span className="flex items-center gap-1.5 border-b-2 border-transparent group-hover:border-black transition-all">
                                <Building className="h-3 w-3" />
                                {job.company_bio?.split(' ')[0] ?? 'Company'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" />
                                {job.location} ({job.work_mode})
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Briefcase className="h-3 w-3" />
                                {job.type.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* AI Match Reason */}
                    <div className="mt-6 border-2 border-black bg-gray-50 p-4 relative">
                        <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-widest border-2 border-black">
                            AI REASONING
                        </div>
                        <div className="flex items-start">
                            <Sparkles className="h-4 w-4 text-black mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm font-medium text-black leading-relaxed">
                                {job.matchReason}
                            </p>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono font-black uppercase tracking-widest text-gray-400">
                            <span className="text-black">{salaryString}</span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                POSTED {getJobDate(job.created_at).toLocaleDateString().toUpperCase()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-black group-hover:underline decoration-2 underline-offset-4">
                            Details
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
