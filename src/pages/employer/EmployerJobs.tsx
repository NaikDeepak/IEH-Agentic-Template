import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { JobService } from '../../features/jobs/services/jobService';
import { Header } from '../../components/Header';
import type { JobPosting, JobStatus } from '../../features/jobs/types';
import {
    Loader2, Plus, Briefcase, Users, Pencil, Trash2,
    PauseCircle, PlayCircle,
} from 'lucide-react';

const STATUS_BADGE: Record<JobStatus, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    passive: 'bg-amber-50 text-amber-700 border-amber-100',
    closed: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const EmployerJobs: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // jobId
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null); // jobId pending delete
    const [filter, setFilter] = useState<'all' | JobStatus>('all');

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const result = await JobService.getJobsByEmployerId(user.uid);
                setJobs(result);
            } catch (err) {
                console.error('[EmployerJobs] load error:', err);
                setError('Failed to load your job postings.');
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [user]);

    const handleToggleStatus = async (job: JobPosting) => {
        if (!job.id) return;
        const next: JobStatus = job.status === 'active' ? 'passive' : 'active';
        setActionLoading(job.id);
        try {
            await JobService.setJobStatus(job.id, next);
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: next } : j));
        } catch (err) {
            console.error('[EmployerJobs] status toggle error:', err);
            setError('Failed to update job status. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (jobId: string) => {
        setActionLoading(jobId);
        try {
            await JobService.setJobStatus(jobId, 'closed');
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'closed' } : j));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('[EmployerJobs] close job error:', err);
            setError('Failed to close job posting. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow container mx-auto px-4 md:px-8 py-12">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-slate-200 pb-8">
                    <div>
                        <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2 block">Employer</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Manage Postings</h1>
                    </div>
                    <button
                        onClick={() => navigate('/post-job')}
                        className="flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white px-6 py-3 font-semibold text-sm rounded-xl transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Post New Job
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Filter tabs */}
                {!loading && jobs.length > 0 && (
                    <div className="flex gap-2 mb-6">
                        {(['all', 'active', 'passive', 'closed'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => { setFilter(s); }}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                                    filter === s
                                        ? 'bg-sky-700 text-white'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                {s === 'all' ? `All (${jobs.length})` : `${s} (${jobs.filter(j => j.status === s).length})`}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                        <p className="text-sm text-slate-400">Loading your job postings...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                        <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 mb-6">You haven't posted any jobs yet.</p>
                        <button
                            onClick={() => navigate('/post-job')}
                            className="inline-flex items-center gap-2 text-sm font-semibold bg-sky-700 hover:bg-sky-800 text-white px-6 py-3 rounded-xl transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Post Your First Job
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-400">
                        No {filter} postings.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered
                            .filter((job): job is JobPosting & { id: string } => !!job.id)
                            .map(job => (
                                <JobRow
                                    key={job.id}
                                    job={job}
                                    actionLoading={actionLoading === job.id}
                                    deleteConfirm={deleteConfirm === job.id}
                                    onViewApplicants={() => navigate(`/employer/jobs/${job.id}/applicants`)}
                                    onEdit={() => navigate(`/post-job?edit=${job.id}`)}
                                    onToggleStatus={() => void handleToggleStatus(job)}
                                    onRequestDelete={() => { setDeleteConfirm(job.id); }}
                                    onConfirmDelete={() => void handleDelete(job.id)}
                                    onCancelDelete={() => { setDeleteConfirm(null); }}
                                />
                            ))}
                    </div>
                )}
            </main>
        </div>
    );
};

// ── Job row ───────────────────────────────────────────────────────────────────

interface JobRowProps {
    job: JobPosting & { id: string };
    actionLoading: boolean;
    deleteConfirm: boolean;
    onViewApplicants: () => void;
    onEdit: () => void;
    onToggleStatus: () => void;
    onRequestDelete: () => void;
    onConfirmDelete: () => void;
    onCancelDelete: () => void;
}

const JobRow: React.FC<JobRowProps> = ({
    job, actionLoading, deleteConfirm,
    onViewApplicants, onEdit, onToggleStatus, onRequestDelete, onConfirmDelete, onCancelDelete,
}) => {
    const isPaused = job.status === 'passive';
    const isClosed = job.status === 'closed';

    if (deleteConfirm) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm font-medium text-red-700">
                    Close <span className="font-bold">"{job.title}"</span>? You can reactivate it later.
                </p>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={onCancelDelete}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirmDelete}
                        disabled={actionLoading}
                        className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                        Close Job
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-sky-700" />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-semibold text-slate-900 truncate">{job.title}</p>
                        <span className={`px-2.5 py-0.5 text-[11px] font-semibold border rounded-full capitalize ${STATUS_BADGE[job.status]}`}>
                            {job.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400">{job.location} · {job.type?.replace('_', ' ')}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {/* View Applicants */}
                <button
                    onClick={onViewApplicants}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                >
                    <Users className="w-3.5 h-3.5" /> Applicants
                </button>

                {/* Edit */}
                <button
                    onClick={onEdit}
                    title="Edit posting"
                    className="p-2 text-slate-400 hover:text-sky-700 hover:bg-sky-50 rounded-xl border border-transparent hover:border-sky-100 transition-colors"
                >
                    <Pencil className="w-4 h-4" />
                </button>

                {/* Pause / Unpause */}
                {!isClosed && (
                    <button
                        onClick={onToggleStatus}
                        disabled={actionLoading}
                        title={isPaused ? 'Make active' : 'Pause posting'}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-100 transition-colors disabled:opacity-50"
                    >
                        {actionLoading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : isPaused
                                ? <PlayCircle className="w-4 h-4" />
                                : <PauseCircle className="w-4 h-4" />
                        }
                    </button>
                )}

                {/* Close Job */}
                {!isClosed && (
                    <button
                        onClick={onRequestDelete}
                        title="Close posting"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};
