import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShortlistService, type ShortlistResult } from '../../services/shortlistService';
import type { JobPosting } from '../../../jobs/types';
import { Briefcase, MapPin, Building, Clock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
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
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500">Curating your daily job feed...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <button
                    onClick={() => { window.location.reload(); }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Cold Start Handling
    if (shortlist?.isColdStart) {
        return (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100 shadow-sm text-center">
                <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-6">
                    <Sparkles className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Unlock Your Personalized Job Feed
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                    We can't recommend jobs yet because we don't know your skills.
                    Upload your resume to get 5 curated job matches every day.
                </p>
                <button
                    onClick={() => navigate('/seeker/resume')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Complete your profile
                    <ArrowRight className="ml-2 h-5 w-5" />
                </button>
            </div>
        );
    }

    if (!shortlist || shortlist.jobs.length === 0) {
        return (
            <div className="bg-gray-50 p-8 rounded-xl text-center border border-gray-200">
                <p className="text-gray-500">No new recommendations for today. Check back tomorrow!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                        Daily Top 5
                    </h2>
                    <p className="text-sm text-gray-500">
                        Updated {shortlist.lastUpdated ? new Date(shortlist.lastUpdated).toLocaleDateString() : 'today'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {shortlist.jobs.map((job) => (
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
            className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
            {/* Match Score Badge */}
            <div className="absolute top-0 right-0 bg-green-50 px-3 py-1 rounded-bl-xl border-b border-l border-green-100">
                <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-green-700">
                        {Math.round(job.matchScore * 100)}% Match
                    </span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                {/* Company Logo / Placeholder */}
                <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {job.company_bio ? job.company_bio.substring(0, 1).toUpperCase() : <Building className="h-6 w-6" />}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {job.title}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                    <Building className="h-3.5 w-3.5 mr-1" />
                                    {/* Ideally we'd have company name here, using bio or separate field */}
                                    Company
                                </span>
                                <span className="flex items-center">
                                    <MapPin className="h-3.5 w-3.5 mr-1" />
                                    {job.location} ({job.work_mode})
                                </span>
                                <span className="flex items-center">
                                    <Briefcase className="h-3.5 w-3.5 mr-1" />
                                    {job.type.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* AI Match Reason */}
                    <div className="mt-3 bg-indigo-50 rounded-md p-3">
                        <div className="flex items-start">
                            <Sparkles className="h-4 w-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-sm text-indigo-900">
                                <span className="font-medium">Why it matches:</span> {job.matchReason}
                            </p>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                            <span>{salaryString}</span>
                            <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Posted {getJobDate(job.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
