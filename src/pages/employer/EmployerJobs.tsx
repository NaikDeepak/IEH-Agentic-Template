import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { JobService } from '../../features/jobs/services/jobService';
import { Header } from '../../components/Header';
import { JobCard } from '../../components/JobCard';
import { Loader2, Plus, Briefcase } from 'lucide-react';
import type { JobPosting } from '../../features/jobs/types';
import type { Job } from '../../types/index';

export const EmployerJobs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const employerJobs = await JobService.getJobsByEmployerId(user.uid);
        setJobs(employerJobs);
      } catch (err) {
        console.error('Error fetching employer jobs:', err);
        setError('Failed to load your job postings.');
      } finally {
        setLoading(false);
      }
    };

    void fetchJobs();
  }, [user]);

  const handleViewApplicants = (jobId: string) => {
    void navigate(`/employer/jobs/${jobId}/applicants`);
  };

  const handlePostJob = () => {
    void navigate('/post-job');
  };

  // Helper to map JobPosting to Job type expected by JobCard
  const mapJobPostingToJob = (jp: JobPosting): Job => {
    return {
      id: jp.id ?? '',
      employerId: jp.employer_id,
      title: jp.title,
      description: jp.description,
      status: jp.status,
      lastActiveAt: jp.lastActiveAt ?? jp.updated_at,
      expiresAt: jp.expiresAt ?? jp.updated_at,
      createdAt: jp.created_at,
      updatedAt: jp.updated_at,
      location: jp.location,
      type: jp.type.toLowerCase().replace('_', '-') as Job['type'],
      salaryRange: jp.salary_range
    };
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-black selection:bg-black selection:text-white">
      <Header />

      <main className="flex-grow container mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b-4 border-black pb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-6 h-6" />
              <span className="font-mono text-xs font-black uppercase tracking-[0.3em]">Employer Dashboard</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Manage Your Postings
            </h1>
          </div>

          <button
            onClick={handlePostJob}
            className="flex items-center gap-3 bg-black text-white px-8 py-4 font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="font-mono text-xs uppercase tracking-widest text-gray-500">Retrieving records...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-600 p-8 font-mono text-sm text-red-600 shadow-[8px_8px_0px_0px_rgba(220,38,38,0.1)]">
            <p className="font-black uppercase mb-2">[DATABASE_ERROR]</p>
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="border-4 border-dashed border-gray-200 p-16 text-center">
            <p className="text-xl font-medium text-gray-400 mb-8 uppercase tracking-tight">You haven't posted any jobs yet.</p>
            <button
              onClick={handlePostJob}
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest border-2 border-black px-6 py-3 hover:bg-black hover:text-white transition-all"
            >
              Get Started <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={mapJobPostingToJob(job)}
                onViewApplicants={() => { if (job.id) handleViewApplicants(job.id); }}
                onClick={() => { if (job.id) void navigate(`/jobs?id=${job.id}`); }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
