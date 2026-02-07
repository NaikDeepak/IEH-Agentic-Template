import React, { useEffect, useState } from 'react';
import { JobService } from '../features/jobs/services/jobService';
import type { JobPosting } from '../features/jobs/types';
import type { Job } from '../types';
import { JobCard } from '../components/JobCard';
import { JobSearchBar } from '../components/JobSearchBar';
import { Header } from '../components/Header';
import { Loader2 } from 'lucide-react';

export const JobsPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const jobPostings = await JobService.getJobs();
                const mappedJobs: Job[] = jobPostings.map(mapJobPostingToJob);
                setJobs(mappedJobs);
            } catch (err) {
                console.error("Failed to fetch jobs:", err);
                setError("Failed to load jobs. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        void fetchJobs();
    }, []);

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
                    <div className="w-full flex justify-center py-4">
                        <JobSearchBar />
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-12">
                            {error}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center text-slate-500 py-12">
                            <h3 className="text-xl font-semibold mb-2">No active jobs found</h3>
                            <p>Check back later for new opportunities.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
