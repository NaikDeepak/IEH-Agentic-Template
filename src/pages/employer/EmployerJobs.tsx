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
  const mapJobPostingToJob = (jp: JobPosting & { id: string }): Job => {
    const normalizedType = (jp.type.toLowerCase().replace('_', '-')) as Job['type'];

    return {
      id: jp.id,
      employerId: jp.employer_id,
      title: jp.title,
      description: jp.description,
      status: jp.status,
      lastActiveAt: jp.lastActiveAt ?? jp.updated_at,
      expiresAt: jp.expiresAt ?? jp.updated_at,
      createdAt: jp.created_at,
      updatedAt: jp.updated_at,
      location: jp.location,
      type: normalizedType,
      salaryRange: jp.salary_range
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-slate-200 pb-8">
          <div>
            <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2 block">Employer Dashboard</span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Manage Your Postings
            </h1>
          </div>

          <button
            onClick={handlePostJob}
            className="flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white px-6 py-3 font-semibold text-sm rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-sm text-slate-400">Loading your job postings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-600">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-6">You haven't posted any jobs yet.</p>
            <button
              onClick={handlePostJob}
              className="inline-flex items-center gap-2 text-sm font-semibold bg-sky-700 hover:bg-sky-800 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs
              .filter((job): job is JobPosting & { id: string } => !!job.id)
              .map((job) => (
                <JobCard
                  key={job.id}
                  job={mapJobPostingToJob(job)}
                  onViewApplicants={() => {
                    handleViewApplicants(job.id);
                  }}
                  onClick={() => {
                    void navigate(`/jobs?id=${job.id}`);
                  }}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
};
