import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { JobService } from '../../features/jobs/services/jobService';
import { Header } from '../../components/Header';
import type { JobPosting } from '../../features/jobs/types';
import {
    Briefcase, Plus, Search, Users, Building2, ArrowRight,
    Loader2, TrendingUp, PauseCircle, CheckCircle2, BarChart2,
} from 'lucide-react';

export const EmployerDashboard: React.FC = () => {
    const { user, userData } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            try {
                const result = await JobService.getJobsByEmployerId(user.uid);
                setJobs(result);
            } catch (err) {
                console.error('[EmployerDashboard] Failed to load jobs:', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [user]);

    const activeJobs = jobs.filter(j => j.status === 'active');
    const pausedJobs = jobs.filter(j => j.status === 'passive');
    const closedJobs = jobs.filter(j => j.status === 'closed');
    const recentJobs = [...jobs]
        .sort((a, b) => {
            const aTime = (a.updated_at as { seconds: number } | null)?.seconds ?? 0;
            const bTime = (b.updated_at as { seconds: number } | null)?.seconds ?? 0;
            return bTime - aTime;
        })
        .slice(0, 5);

    const companyName = userData?.displayName;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-6xl">

                {/* Page header */}
                <div className="mb-10 border-b border-slate-200 pb-8">
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest block mb-1">Employer Dashboard</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                        Welcome back{companyName ? `, ${companyName}` : ''}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Here's an overview of your hiring activity.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                        <p className="text-sm text-slate-400">Loading your dashboard...</p>
                    </div>
                ) : (
                    <>
                        {/* KPI cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            <KpiCard
                                icon={<Briefcase className="w-5 h-5 text-sky-700" />}
                                bg="bg-sky-50"
                                label="Total Postings"
                                value={jobs.length}
                            />
                            <KpiCard
                                icon={<TrendingUp className="w-5 h-5 text-emerald-700" />}
                                bg="bg-emerald-50"
                                label="Active Jobs"
                                value={activeJobs.length}
                            />
                            <KpiCard
                                icon={<PauseCircle className="w-5 h-5 text-amber-600" />}
                                bg="bg-amber-50"
                                label="Paused"
                                value={pausedJobs.length}
                            />
                            <KpiCard
                                icon={<CheckCircle2 className="w-5 h-5 text-slate-500" />}
                                bg="bg-slate-100"
                                label="Closed"
                                value={closedJobs.length}
                            />
                        </div>

                        {/* Quick actions */}
                        <div className="mb-10">
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                <ActionButton
                                    icon={<Plus className="w-4 h-4" />}
                                    label="Post a Job"
                                    onClick={() => navigate('/post-job')}
                                    primary
                                />
                                <ActionButton
                                    icon={<Search className="w-4 h-4" />}
                                    label="Search Talent"
                                    onClick={() => navigate('/employer/search')}
                                />
                                <ActionButton
                                    icon={<Users className="w-4 h-4" />}
                                    label="Manage Jobs"
                                    onClick={() => navigate('/employer/jobs')}
                                />
                                <ActionButton
                                    icon={<Building2 className="w-4 h-4" />}
                                    label="Edit Company"
                                    onClick={() => navigate('/employer/company')}
                                />
                                <ActionButton
                                    icon={<BarChart2 className="w-4 h-4" />}
                                    label="Analytics"
                                    onClick={() => navigate('/employer/analytics')}
                                />
                            </div>
                        </div>

                        {/* Recent postings */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Recent Postings</h2>
                                <button
                                    onClick={() => navigate('/employer/jobs')}
                                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
                                >
                                    View all <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {recentJobs.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm text-slate-500 mb-5">No job postings yet.</p>
                                    <button
                                        onClick={() => navigate('/post-job')}
                                        className="inline-flex items-center gap-2 text-sm font-semibold bg-sky-700 hover:bg-sky-800 text-white px-5 py-2.5 rounded-xl transition-colors"
                                    >
                                        <Plus className="w-4 h-4" /> Post Your First Job
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft divide-y divide-slate-100">
                                    {recentJobs.map(job => (
                                        <div
                                            key={job.id}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 gap-2 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{job.title}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{job.location}</p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <StatusBadge status={job.status} />
                                                <button
                                                    onClick={() => navigate(`/employer/jobs/${job.id}/applicants`)}
                                                    className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
                                                >
                                                    Applicants <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface KpiCardProps { icon: React.ReactNode; bg: string; label: string; value: number }
const KpiCard: React.FC<KpiCardProps> = ({ icon, bg, label, value }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>{icon}</div>
        <div>
            <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        </div>
    </div>
);

interface ActionButtonProps { icon: React.ReactNode; label: string; onClick: () => void; primary?: boolean }
const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, primary }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors w-full ${
            primary
                ? 'bg-sky-700 hover:bg-sky-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
        }`}
    >
        {icon} {label}
    </button>
);

interface StatusBadgeProps { status: string }
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const map: Record<string, string> = {
        active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        passive: 'bg-amber-50 text-amber-700 border-amber-100',
        closed: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    return (
        <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border capitalize ${map[status] ?? map.closed}`}>
            {status}
        </span>
    );
};
