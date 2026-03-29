import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobService } from '../features/jobs/services/jobService';
import type { JobPosting } from '../features/jobs/types';
import type { Job } from '../types';
import { JobCard } from '../components/JobCard';
import { JobSearchBar } from '../components/JobSearchBar';
import type { JobSearchFilters } from '../features/jobs/types';
import { DEFAULT_JOB_SEARCH_FILTERS } from '../features/jobs/types';
import { ApplyModal } from '../components/ApplyModal';
import { Header } from '../components/Header';
import { SkeletonJobCard } from '../components/ui/Skeleton';
import { X } from 'lucide-react';
import * as Sentry from '@sentry/react';
import { searchJobs, getJobSuggestions } from '../lib/ai/search';
import { useAuth } from '../hooks/useAuth';
import { SavedJobsService } from '../features/seeker/services/savedJobsService';

type JobWithMatch = Job & { matchScore?: number };

// Helper to map backend type to frontend type
const mapJobPostingToJob = (posting: JobPosting): Job => {
    // Map backend enum to frontend union type safely
    let jobType: Job['type'] = undefined;
     
    if (posting.type) {
        const typeStr = posting.type.toLowerCase().replace('_', '-');
        // specific mapping if needed, otherwise cast
        if (['full-time', 'part-time', 'contract', 'freelance', 'internship'].includes(typeStr)) {
            jobType = typeStr as Job['type'];
        }
    }

    // Spread raw posting data first to preserve fields like work_mode,
    // experience, experience_level for local filter matching
    return {
        ...(posting as unknown as Record<string, unknown>),
        id: posting.id ?? '',
        employerId: posting.employer_id,
        title: posting.title,
        description: posting.description,
        status: posting.status === 'active' ? 'active' :
            posting.status === 'passive' ? 'passive' : 'closed',
        lastActiveAt: posting.lastActiveAt ?? posting.created_at,
        expiresAt: posting.expiresAt ?? posting.created_at,
        createdAt: posting.created_at,
        updatedAt: posting.updated_at,
        location: posting.location,
        type: jobType,
        salaryRange: posting.salary_range
    };
};

export const JobsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, userData } = useAuth();
    const isSeeker = userData?.role === 'seeker';

    // browseJobs holds the default list (Active First) to restore after search
    const [browseJobs, setBrowseJobs] = useState<Job[]>([]);
    // displayedJobs is what's currently shown on screen
    const [displayedJobs, setDisplayedJobs] = useState<JobWithMatch[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [currentSearchQuery, setCurrentSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [applyingJob, setApplyingJob] = useState<JobPosting | null>(null);
    const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
    const [saveInFlightIds, setSaveInFlightIds] = useState<Set<string>>(new Set());

    const userId = user?.uid ?? null;

    useEffect(() => {
        if (authLoading || !userId) return;

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
    }, [authLoading, userId]);

    useEffect(() => {
        if (!userId || !isSeeker) return;
        void SavedJobsService.getSavedJobIds(userId).then(ids => { setSavedJobIds(ids); }).catch(() => { /* non-critical, saved state unavailable */ });
    }, [userId, isSeeker]);

    const handleSearch = async (term: string, filters: Partial<JobSearchFilters>) => {
        const query = term;
        const mergedFilters: JobSearchFilters = { ...DEFAULT_JOB_SEARCH_FILTERS, ...filters };

        const hasActiveFilters =
            mergedFilters.workMode !== 'All' ||
            mergedFilters.jobType !== 'All' ||
            mergedFilters.city.trim() !== '' ||
            mergedFilters.experienceLevel !== 'All' ||
            mergedFilters.salaryMin !== '';

        // No query AND no filters → reset to browse list
        if (!query.trim() && !hasActiveFilters) {
            handleClearSearch();
            return;
        }

        // No query but filters active → apply client-side filtering on browse list
        if (!query.trim() && hasActiveFilters) {
            setIsSearching(true);
            setCurrentSearchQuery('');
            const filtered = applyLocalFilters(browseJobs, mergedFilters);
            setDisplayedJobs(filtered);
            setSuggestions([]);
            return;
        }

        // Query present → run backend semantic search with filters
        try {
            setLoading(true);
            setError(null);
            setIsSearching(true);
            setCurrentSearchQuery(query);

            const results = await searchJobs(query, mergedFilters);

            const mappedResults: JobWithMatch[] = results.map((result) => {
                const posting = result as unknown as JobPosting;
                const matchScore = (result['matchScore'] as number | undefined) ?? 0;
                return { ...mapJobPostingToJob(posting), matchScore };
            });

            setDisplayedJobs(mappedResults);
            setSuggestions([]);

            // If no results, fetch fuzzy suggestions — guard against stale responses
            if (mappedResults.length === 0) {
                const thisQuery = query;
                void getJobSuggestions(thisQuery).then(s => {
                    setCurrentSearchQuery(cq => {
                        if (cq === thisQuery) setSuggestions(s);
                        return cq;
                    });
                });
            }
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
        setSuggestions([]);
        setError(null);
    };

    const handleSaveJob = async (jobId: string) => {
        if (!userId) return;
        if (saveInFlightIds.has(jobId)) return;

        setSaveInFlightIds(prev => new Set([...prev, jobId]));
        const wasSaved = savedJobIds.has(jobId);
        if (wasSaved) {
            setSavedJobIds(prev => { const next = new Set(prev); next.delete(jobId); return next; });
        } else {
            setSavedJobIds(prev => new Set([...prev, jobId]));
        }

        const isSaved = savedJobIds.has(jobId);
        try {
            if (isSaved) {
                await SavedJobsService.unsave(userId, jobId);
            } else {
                const posting = await JobService.getJobById(jobId);
                if (!posting) {
                    throw new Error('Job not found while saving');
                }
                await SavedJobsService.save(userId, posting);
            }
        } catch (err) {
            console.error('[JobsPage] save toggle failed:', err);
            setSavedJobIds(prev => {
                const next = new Set(prev);
                if (wasSaved) next.add(jobId);
                else next.delete(jobId);
                return next;
            });
        } finally {
            setSaveInFlightIds(prev => {
                const next = new Set(prev);
                next.delete(jobId);
                return next;
            });
        }
    };

    const handleApply = async (jobId: string) => {
        try {
            const posting = await JobService.getJobById(jobId);
            if (posting) {
                setApplyingJob(posting);
            } else {
                void navigate(`/jobs/${jobId}`);
            }
        } catch {
            void navigate(`/jobs/${jobId}`);
        }
    };

    /**
     * Apply search filters locally against the browse job list.
     * Used when filters are active but no search query is entered.
     */
    const applyLocalFilters = (jobs: Job[], f: JobSearchFilters): JobWithMatch[] => {
        return jobs.filter(job => {
            // Work mode — match against location field (backend stores work_mode, frontend Job doesn't expose it directly)
            // Fall back to checking the raw posting data via the browse list
            if (f.workMode !== 'All') {
                const raw = job as unknown as Record<string, unknown>;
                const workMode = (raw['work_mode'] as string | undefined) ?? '';
                const modeMap: Record<string, string> = { 'Remote': 'remote', 'Hybrid': 'hybrid', 'Office': 'onsite' };
                const expected = modeMap[f.workMode] ?? f.workMode.toLowerCase();
                if (workMode.toLowerCase() !== expected) return false;
            }

            // Job type
            if (f.jobType !== 'All') {
                const typeStr = (job.type ?? '').toLowerCase().replace(/_/g, '-');
                if (typeStr !== f.jobType.toLowerCase()) return false;
            }

            // City
            if (f.city.trim()) {
                const loc = (job.location ?? '').toLowerCase();
                if (!loc.includes(f.city.trim().toLowerCase())) return false;
            }

            // Experience level
            if (f.experienceLevel !== 'All') {
                const raw = job as unknown as Record<string, unknown>;
                const exp = ((raw['experience_level'] as string | undefined) ?? (raw['experience'] as string | undefined) ?? '').toLowerCase();
                if (!exp.startsWith(f.experienceLevel.toLowerCase())) return false;
            }

            // Salary
            if (f.salaryMin) {
                const min = Number(f.salaryMin);
                if (min > 0 && job.salaryRange) {
                    if (job.salaryRange.max < min) return false;
                }
            }

            return true;
        });
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
                        <div className="py-20 text-center flex flex-col items-center gap-6">
                            <div>
                                <h3 className="text-2xl font-semibold text-slate-400 mb-2">
                                    {isSearching ? "No matches found" : "No active roles"}
                                </h3>
                                <p className="text-sm text-slate-400">
                                    {isSearching
                                        ? "Try a different search or clear your filters."
                                        : "Check back later for updates."}
                                </p>
                            </div>

                            {isSearching && suggestions.length > 0 && (
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-sm text-slate-500 font-medium">Did you mean:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {suggestions.map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                onClick={() => { void handleSearch(suggestion, {}); }}
                                                className="px-4 py-2 bg-white border border-sky-200 hover:border-sky-400 hover:bg-sky-50 text-sky-700 text-sm font-medium rounded-full transition-all shadow-soft"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isSearching && (
                                <button
                                    onClick={handleClearSearch}
                                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl transition-colors"
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
                                    onApply={isSeeker ? (e) => { e.stopPropagation(); void handleApply(job.id); } : undefined}
                                    onSave={isSeeker ? (e: React.MouseEvent) => { e.stopPropagation(); void handleSaveJob(job.id); } : undefined}
                                    isSaved={savedJobIds.has(job.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

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
