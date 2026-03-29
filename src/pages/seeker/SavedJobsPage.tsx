import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { useAuth } from '../../hooks/useAuth';
import { SavedJobsService } from '../../features/seeker/services/savedJobsService';
import { ApplyModal } from '../../components/ApplyModal';
import type { JobPosting } from '../../features/jobs/types';
import { Loader2, Bookmark, MapPin, Briefcase, Trash2, Send } from 'lucide-react';

export const SavedJobsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [applyingJob, setApplyingJob] = useState<JobPosting | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            try {
                const saved = await SavedJobsService.getSavedBySeeker(user.uid);
                setJobs(saved);
            } catch (err) {
                console.error('[SavedJobsPage] load error:', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [user]);

    const handleUnsave = async (jobId: string) => {
        if (!user) return;
        if (!jobId || actionLoadingId === jobId) return;
        setActionLoadingId(jobId);
        setActionError(null);
        try {
            await SavedJobsService.unsave(user.uid, jobId);
            setJobs(prev => prev.filter(j => j.id !== jobId));
        } catch (err) {
            console.error('[SavedJobsPage] unsave failed:', err);
            setActionError('Failed to remove saved job. Please try again.');
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-5xl">
                <div className="mb-10 border-b border-slate-200 pb-8">
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2 block">Seeker</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
                        <Bookmark className="w-7 h-7 text-sky-700" />
                        Saved Jobs
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Jobs you've bookmarked for later.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                        <p className="text-sm text-slate-400">Loading saved jobs...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                        <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 mb-2 font-semibold">No saved jobs yet</p>
                        <p className="text-sm text-slate-400 mb-6">Bookmark jobs from search results to come back to them.</p>
                        <button
                            onClick={() => { void navigate('/jobs'); }}
                            className="inline-flex items-center gap-2 text-sm font-semibold bg-sky-700 hover:bg-sky-800 text-white px-6 py-2.5 rounded-xl transition-colors"
                        >
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {actionError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                {actionError}
                            </div>
                        )}
                        {jobs.map(job => (
                            <div
                                key={job.id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div
                                    className="flex-1 min-w-0 cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => { void navigate(`/jobs/${job.id ?? ''}`); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { void navigate(`/jobs/${job.id ?? ''}`); } }}
                                >
                                    <p className="text-sm font-semibold text-slate-900 hover:text-sky-700 transition-colors">{job.title}</p>
                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                                        {job.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {job.location}
                                            </span>
                                        )}
                                        {job.type && (
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-3 h-3" /> {job.type.replace(/_/g, ' ')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => { setApplyingJob(job); }}
                                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-xl transition-colors"
                                    >
                                        <Send className="w-3 h-3" /> Apply
                                    </button>
                                    <button
                                        onClick={() => { void handleUnsave(job.id ?? ''); }}
                                        title="Remove from saved"
                                        disabled={actionLoadingId === job.id}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-colors"
                                    >
                                        {actionLoadingId === job.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
