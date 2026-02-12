import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div className="min-h-screen bg-white flex flex-col font-sans text-black selection:bg-black selection:text-white">
            <Header />

            <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-7xl">
                <div className="flex flex-col gap-16">

                    {/* Header / Title Section */}
                    <div className="flex flex-col gap-6 border-b-2 border-black pb-8">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-0 leading-none">
                            Open Positions
                        </h1>
                        <p className="text-xl md:text-2xl font-light text-gray-500 max-w-2xl leading-relaxed tracking-tight">
                            Find your next role in our curated list of opportunities. <br />
                            <span className="text-black font-medium">Powered by semantic search.</span>
                        </p>
                    </div>

                    {/* Search Section */}
                    <div className="w-full relative z-10">
                        <JobSearchBar onSearch={handleSearch} />
                    </div>

                    {/* Search Status / Clear */}
                    {isSearching && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-l-4 border-black pl-6 py-2 gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                            <div>
                                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mb-1">
                                    Search Results
                                </h2>
                                <p className="text-2xl font-bold text-black tracking-tight">
                                    "{currentSearchQuery}" <span className="text-gray-400 font-normal italic">in context</span>
                                </p>
                            </div>
                            <button
                                onClick={handleClearSearch}
                                className="group flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-black hover:text-white transition-all duration-200 font-mono text-xs uppercase tracking-widest font-bold"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-64 gap-6">
                            <Loader2 className="w-12 h-12 animate-spin text-black" />
                            <span className="font-mono text-sm uppercase tracking-widest animate-pulse font-bold">Processing Data...</span>
                        </div>
                    ) : error ? (
                        <div className="border-4 border-black p-12 text-center bg-gray-50">
                            <h3 className="text-3xl font-black text-black uppercase mb-4">System Error</h3>
                            <p className="font-mono text-gray-500 mb-8">{error}</p>
                            {isSearching && (
                                <button
                                    onClick={handleClearSearch}
                                    className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                                >
                                    Reset Search
                                </button>
                            )}
                        </div>
                    ) : displayedJobs.length === 0 ? (
                        <div className="py-24 border-y-2 border-dashed border-gray-200 text-center">
                            <h3 className="text-4xl font-black text-gray-300 uppercase tracking-tighter mb-4">
                                {isSearching ? "0 Matches Found" : "No Active Roles"}
                            </h3>
                            <p className="font-mono text-gray-400 uppercase tracking-widest text-sm">
                                {isSearching
                                    ? "Refine your parameters or clear filters."
                                    : "Check back later for updates."}
                            </p>
                            {isSearching && (
                                <button
                                    onClick={handleClearSearch}
                                    className="mt-8 px-8 py-3 border-2 border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
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
