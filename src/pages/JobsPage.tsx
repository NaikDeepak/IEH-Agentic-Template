import React, { useEffect, useState } from 'react';
import { JobService } from '../features/jobs/services/jobService';
import type { JobPosting } from '../features/jobs/types';
import type { Job } from '../types';
import { JobCard } from '../components/JobCard';
import { JobSearchBar } from '../components/JobSearchBar';
import { Header } from '../components/Header';
import { Loader2, X } from 'lucide-react';
import { searchJobs } from '../lib/ai/search';

type JobWithMatch = Job & { matchScore?: number };

export const JobsPage: React.FC = () => {
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
                console.error("Failed to fetch jobs:", err);
                setError("Failed to load jobs. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        void fetchJobs();
    }, []);

    const handleSearch = async (term: string, location: string) => {
        const query = [term, location !== 'Remote' ? location : ''].filter(Boolean).join(' ');

        if (!query.trim()) {
            handleClearSearch();
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setIsSearching(true);
            setCurrentSearchQuery(query);

            const results = await searchJobs(query);

            const mappedResults: JobWithMatch[] = results.map((result) => {
                const posting = result as unknown as JobPosting;
                const matchScore = (result._matchScore as number | undefined) ?? 0;

                // Convert to percentage if it's a decimal (e.g., 0.85 -> 85)
                // Assuming backend returns decimal 0-1 based on cosine similarity,
                // but if it returns 0-100, we'll need to check.
                // Context says "Display a badge X% Match".
                // Usually cosine similarity is -1 to 1.
                // Let's assume the API handles it or we normalize.
                // If the score is <= 1, multiply by 100.
                const normalizedScore = matchScore <= 1 ? matchScore * 100 : matchScore;

                return {
                    ...mapJobPostingToJob(posting),
                    matchScore: normalizedScore
                };
            });

            setDisplayedJobs(mappedResults);
        } catch (err) {
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
            status: posting.status,
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
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col gap-8">
                    {/* Search Section */}
                    <div className="w-full flex justify-center py-4 relative">
                        <JobSearchBar onSearch={handleSearch} />
                    </div>

                    {/* Search Status / Clear */}
                    {isSearching && (
                        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg p-4 -mt-4">
                            <div>
                                <h2 className="text-lg font-semibold text-indigo-900">
                                    Search Results
                                </h2>
                                <p className="text-sm text-indigo-700">
                                    Showing top matches for <span className="font-bold">"{currentSearchQuery}"</span> based on semantic meaning.
                                </p>
                            </div>
                            <button
                                onClick={handleClearSearch}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-md border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Clear Search
                            </button>
                        </div>
                    )}

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-12">
                            {error}
                            {isSearching && (
                                <div className="mt-4">
                                    <button
                                        onClick={handleClearSearch}
                                        className="text-indigo-600 underline hover:text-indigo-800"
                                    >
                                        Return to browse
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : displayedJobs.length === 0 ? (
                        <div className="text-center text-slate-500 py-12">
                            <h3 className="text-xl font-semibold mb-2">
                                {isSearching ? "No matching jobs found" : "No active jobs found"}
                            </h3>
                            <p>
                                {isSearching
                                    ? "Try adjusting your search terms or location."
                                    : "Check back later for new opportunities."}
                            </p>
                            {isSearching && (
                                <button
                                    onClick={handleClearSearch}
                                    className="mt-4 text-indigo-600 font-medium hover:underline"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedJobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    matchScore={job.matchScore}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
