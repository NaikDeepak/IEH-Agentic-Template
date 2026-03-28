import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { JobService } from '../../features/jobs/services/jobService';
import { Header } from '../../components/Header';
import type { JobPosting, JobStatus } from '../../features/jobs/types';
import { db } from '../../lib/firebase';
import { collection, getCountFromServer, query, where, Timestamp } from 'firebase/firestore';
import { Loader2, BarChart2, Briefcase, ArrowLeft, Users, TrendingUp, Clock } from 'lucide-react';

interface JobStats {
    job: JobPosting & { id: string };
    appCount: number;
    daysActive: number;
    appsPerDay: number;
}

const STATUS_BADGE: Record<JobStatus, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    passive: 'bg-amber-50 text-amber-700 border-amber-100',
    closed: 'bg-slate-100 text-slate-500 border-slate-200',
};

function getDaysActive(created_at: unknown): number {
    let date: Date | null = null;
    if (created_at instanceof Timestamp) {
        date = created_at.toDate();
    } else if (created_at && typeof created_at === 'object' && 'seconds' in created_at) {
        date = new Date((created_at as { seconds: number }).seconds * 1000);
    }
    if (!date) return 0;
    return Math.max(1, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

const JobAnalyticsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<JobStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<'title' | 'appCount' | 'daysActive' | 'appsPerDay'>('appCount');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            try {
                const jobs = await JobService.getJobsByEmployerId(user.uid);
                const validJobs = jobs.filter((j): j is JobPosting & { id: string } => !!j.id);

                const results = await Promise.all(
                    validJobs.map(async (job) => {
                        const snap = await getCountFromServer(
                            query(collection(db, 'applications'), where('job_id', '==', job.id))
                        );
                        const appCount = snap.data().count;
                        const daysActive = getDaysActive(job.created_at);
                        const appsPerDay = daysActive > 0 ? appCount / daysActive : 0;
                        return { job, appCount, daysActive, appsPerDay };
                    })
                );

                setStats(results);
            } catch (err) {
                console.error('[JobAnalyticsPage] load error:', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [user]);

    const handleSort = (key: typeof sortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const sorted = [...stats].sort((a, b) => {
        let diff = 0;
        if (sortKey === 'title') diff = a.job.title.localeCompare(b.job.title);
        else if (sortKey === 'appCount') diff = a.appCount - b.appCount;
        else if (sortKey === 'daysActive') diff = a.daysActive - b.daysActive;
        else diff = a.appsPerDay - b.appsPerDay;
        return sortDir === 'asc' ? diff : -diff;
    });

    const totalApps = stats.reduce((s, r) => s + r.appCount, 0);
    const activeJobs = stats.filter(r => r.job.status === 'active').length;
    const topJob = stats.length > 0
        ? stats.reduce((best, cur) => cur.appCount > best.appCount ? cur : best)
        : null;

    const SortButton: React.FC<{ col: typeof sortKey; label: string }> = ({ col, label }) => (
        <button
            onClick={() => { handleSort(col); }}
            className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-widest transition-colors ${
                sortKey === col ? 'text-sky-700' : 'text-slate-500 hover:text-slate-800'
            }`}
        >
            {label}
            {sortKey === col && (
                <span className="text-sky-600">{sortDir === 'desc' ? '↓' : '↑'}</span>
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow container mx-auto px-4 md:px-8 py-12">
                <button
                    onClick={() => { void navigate('/employer/jobs'); }}
                    className="group flex items-center gap-1.5 mb-8 text-sm text-slate-400 hover:text-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to postings
                </button>

                <div className="border-b border-slate-200 pb-8 mb-10">
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2 block">Employer</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
                        <BarChart2 className="w-8 h-8 text-sky-700" />
                        Posting Analytics
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Applications and activity across all your job postings</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                        <p className="text-sm text-slate-400">Loading analytics...</p>
                    </div>
                ) : stats.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                        <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No job postings to analyse yet.</p>
                    </div>
                ) : (
                    <>
                        {/* Summary KPIs */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-soft">
                                <div className="w-9 h-9 bg-sky-50 text-sky-700 rounded-lg flex items-center justify-center mb-4">
                                    <Users size={18} strokeWidth={1.5} />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 tabular-nums">{totalApps}</div>
                                <div className="text-xs font-medium text-slate-400 mt-0.5">Total Applications</div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-soft">
                                <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center mb-4">
                                    <TrendingUp size={18} strokeWidth={1.5} />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 tabular-nums">{activeJobs}</div>
                                <div className="text-xs font-medium text-slate-400 mt-0.5">Active Postings</div>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-soft col-span-2 md:col-span-1">
                                <div className="w-9 h-9 bg-violet-50 text-violet-700 rounded-lg flex items-center justify-center mb-4">
                                    <BarChart2 size={18} strokeWidth={1.5} />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 tabular-nums truncate">
                                    {topJob ? topJob.appCount : 0}
                                </div>
                                <div className="text-xs font-medium text-slate-400 mt-0.5 truncate">
                                    Top: {topJob ? topJob.job.title : '—'}
                                </div>
                            </div>
                        </div>

                        {/* Per-job table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-x-auto">
                            <table className="w-full text-sm min-w-[540px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50">
                                        <th className="text-left px-5 py-3.5">
                                            <SortButton col="title" label="Job" />
                                        </th>
                                        <th className="text-left px-5 py-3.5 hidden sm:table-cell">
                                            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Status</span>
                                        </th>
                                        <th className="text-right px-5 py-3.5">
                                            <SortButton col="appCount" label="Applications" />
                                        </th>
                                        <th className="text-right px-5 py-3.5 hidden md:table-cell">
                                            <SortButton col="daysActive" label="Days Active" />
                                        </th>
                                        <th className="text-right px-5 py-3.5 hidden md:table-cell">
                                            <SortButton col="appsPerDay" label="Apps / Day" />
                                        </th>
                                        <th className="text-right px-5 py-3.5 hidden lg:table-cell">
                                            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Rate Bar</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map(({ job, appCount, daysActive, appsPerDay }) => {
                                        const maxApps = Math.max(...stats.map(s => s.appCount), 1);
                                        const barPct = Math.round((appCount / maxApps) * 100);
                                        const barColor = appCount === 0
                                            ? 'bg-slate-200'
                                            : appCount >= maxApps * 0.6
                                                ? 'bg-emerald-500'
                                                : appCount >= maxApps * 0.3
                                                    ? 'bg-sky-500'
                                                    : 'bg-amber-400';

                                        return (
                                            <tr
                                                key={job.id}
                                                className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
                                                onClick={() => { void navigate(`/employer/jobs/${job.id}/applicants`); }}
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                                                            <Briefcase className="w-3.5 h-3.5 text-sky-700" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-slate-900 truncate leading-tight">{job.title}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5 truncate">{job.location}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 hidden sm:table-cell">
                                                    <span className={`inline-flex px-2.5 py-0.5 text-[11px] font-semibold rounded-full border capitalize ${STATUS_BADGE[job.status]}`}>
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className="font-bold text-slate-900 tabular-nums">{appCount}</span>
                                                </td>
                                                <td className="px-5 py-4 text-right hidden md:table-cell">
                                                    <span className="text-slate-500 tabular-nums flex items-center justify-end gap-1">
                                                        <Clock className="w-3 h-3 text-slate-300" />{daysActive}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right hidden md:table-cell">
                                                    <span className="text-slate-500 tabular-nums">{appsPerDay.toFixed(2)}</span>
                                                </td>
                                                <td className="px-5 py-4 hidden lg:table-cell">
                                                    <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${barColor}`}
                                                            style={{ width: `${barPct}%` }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default JobAnalyticsPage;
