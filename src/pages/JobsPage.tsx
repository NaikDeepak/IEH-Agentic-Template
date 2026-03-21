import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobService } from '../features/jobs/services/jobService';
import type { JobPosting } from '../features/jobs/types';
import type { Job } from '../types';
import { JobCard } from '../components/JobCard';
import { JobSearchBar } from '../components/JobSearchBar';
import { Header } from '../components/Header';
import { SkeletonJobCard } from '../components/ui/Skeleton';
import { X } from 'lucide-react';
import * as Sentry from '@sentry/react';
import { searchJobs } from '../lib/ai/search';

type JobWithMatch = Job & { matchScore?: number };

export const JobsPage: React.FC = () => {
    const navigate = useNavigate();
    // browseJobs holds the default list (Active First) to restore after search
    const [browseJobs, setBrowseJobs] = useState<Job[]>([]);
    // displayedJobs is what's currently shown on screen
    const [displayedJobs, setDisplayedJobs] = useState<JobWithMatch[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [currentSearchQuery, setCurrentSearchQuery] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const jobPostings = await JobService.getJobs();
                const mappedJobs: Job[] = jobPostings.map(mapJobPostingToJob);
                setBrowseJobs(mappedJobs);
                setDisplayedJobs(mappedJobs);
            } catch (err) {
                Sentry.captureException(err);
                console.error("Failed to fetch jobs:", err);
                setError("Failed to load jobs. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        void fetchJobs();
    }, []);

    const handleSearch = async (term: string, location: string) => {
        const query = term;

        if (!query.trim()) {
            handleClearSearch();
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setIsSearching(true);
            setCurrentSearchQuery(query);

            // If location is 'All', don't pass it as a filter
            const locationFilter = location === 'All' ? '' : location;
            const results = await searchJobs(query, locationFilter);

            const mappedResults: JobWithMatch[] = results.map((result) => {
                const posting = result as unknown as JobPosting;
                const matchScore = (result['matchScore'] as number | undefined) ?? 0;

                // Backend returns 0-100 based on cosine similarity * 100
                const normalizedScore = matchScore;

                return {
                    ...mapJobPostingToJob(posting),
                    matchScore: normalizedScore
                };
            });

            setDisplayedJobs(mappedResults);
        } catch (err) {
            Sentry.captureException(err);
            console.error("Search failed:", err);
            setError("Search failed. Please try again.");
            setDisplayedJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setIsSearching(false);
        setCurrentSearchQuery('');
        setDisplayedJobs(browseJobs);
        setError(null);
    };

    // Helper to map backend type to frontend type
    const mapJobPostingToJob = (posting: JobPosting): Job => {
        // Map backend enum to frontend union type safely
        let jobType: Job['type'] = undefined;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (posting.type) {
            const typeStr = posting.type.toLowerCase().replace('_', '-');
            // specific mapping if needed, otherwise cast
            if (['full-time', 'part-time', 'contract', 'freelance', 'internship'].includes(typeStr)) {
                jobType = typeStr as Job['type'];
            }
        }

        return {
            id: posting.id ?? '',
            employerId: posting.employer_id,
            title: posting.title,
            description: posting.description,
            // Map JobStatus to ActivityStatus explicitly
            status: posting.status === 'active' ? 'active' :
                posting.status === 'passive' ? 'passive' : 'closed',
            // Fallback to created_at if activity timestamps are missing
            lastActiveAt: posting.lastActiveAt ?? posting.created_at,
            expiresAt: posting.expiresAt ?? posting.created_at,
            createdAt: posting.created_at,
            updatedAt: posting.updated_at,
            location: posting.location,
            type: jobType,
            salaryRange: posting.salary_range
        };
    };

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-7xl">
                <div className="flex flex-col gap-10">

                    {/* Header / Title Section */}
                    <div className="flex flex-col gap-3 border-b border-slate-200 pb-8">
                        <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">Browse Opportunities</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                            Open Positions
                        </h1>
                        <p className="text-base text-slate-500 max-w-2xl leading-relaxed">
                            Find your next role in our curated list of opportunities.{' '}
                            <span className="text-slate-700 font-medium">Powered by semantic search.</span>
                        </p>
                    </div>

                    {/* Search Section */}
                    <div className="w-full relative z-10">
                        <JobSearchBar onSearch={handleSearch} />
                    </div>

                    {/* Search Status / Clear */}
                    {isSearching && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-l-4 border-sky-400 pl-5 py-2 gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div>
                                <h2 className="text-xs font-medium text-slate-400 mb-1">Search Results</h2>
                                <p className="text-xl font-semibold text-slate-900">
                                    "{currentSearchQuery}" <span className="text-slate-400 font-normal">in context</span>
                                </p>
                            </div>
                            <button
                                onClick={handleClearSearch}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl transition-all text-sm font-medium"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Content Section */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonJobCard key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-2xl border border-red-100 p-12 text-center shadow-soft">
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">Something went wrong</h3>
                            <p className="text-slate-500 text-sm mb-8">{error}</p>
                            {isSearching && (
                                <button
                                    onClick={handleClearSearch}
                                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl transition-colors"
                                >
                                    Reset Search
                                </button>
                            )}
                        </div>
                    ) : displayedJobs.length === 0 ? (
                        <div className="py-24 text-center">
                            <h3 className="text-2xl font-semibold text-slate-400 mb-3">
                                {isSearching ? "No matches found" : "No active roles"}
                            </h3>
                            <p className="text-sm text-slate-400">
                                {isSearching
                                    ? "Try a different search or clear your filters."
                                    : "Check back later for updates."}
                            </p>
                            {isSearching && (
                                <button
                                    onClick={handleClearSearch}
                                    className="mt-6 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl transition-colors"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                            {displayedJobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    matchScore={job.matchScore}
                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
