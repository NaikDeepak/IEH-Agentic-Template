import React, { useEffect, useState } from 'react';
import { Users, Briefcase, FileText, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import {
    collection, getCountFromServer, query, where,
    getDocs, orderBy, limit, Timestamp,
} from 'firebase/firestore';

interface LiveStats {
    totalUsers: number;
    activeJobs: number;
    totalApplications: number;
}

interface RecentItem {
    id: string;
    text: string;
    sub: string;
}

interface HealthStatus {
    label: string;
    status: 'healthy' | 'unhealthy';
    detail: string;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<LiveStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentItem[]>([]);
    const [healthStatuses, setHealthStatuses] = useState<HealthStatus[]>([
        { label: 'Firebase Auth', status: 'unhealthy', detail: 'Status checks coming soon' },
        { label: 'Firestore', status: 'unhealthy', detail: 'Status checks coming soon' },
        { label: 'AI Proxy (Express)', status: 'unhealthy', detail: 'Status checks coming soon' },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [userSnap, jobSnap, appSnap] = await Promise.all([
                    getCountFromServer(collection(db, 'users')),
                    getCountFromServer(query(collection(db, 'jobs'), where('status', '==', 'active'))),
                    getCountFromServer(collection(db, 'applications')),
                ]);

                setStats({
                    totalUsers: userSnap.data().count,
                    activeJobs: jobSnap.data().count,
                    totalApplications: appSnap.data().count,
                });

                // Recent activity: latest 5 users
                const recentUsersSnap = await getDocs(
                    query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5))
                );
                const items: RecentItem[] = recentUsersSnap.docs.map(d => {
                    const data = d.data() as { displayName?: string; email?: string; role?: string; createdAt?: Timestamp };
                    const name = data.displayName ?? data.email ?? 'Anonymous';
                    const role = data.role ?? 'user';
                    const ts = data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate().toLocaleDateString()
                        : 'Recently';
                    return { id: d.id, text: `New ${role} registered: ${name}`, sub: ts };
                });
                setRecentActivity(items);
                setHealthStatuses([
                    { label: 'Firebase Auth', status: 'unhealthy', detail: 'Status checks coming soon' },
                    { label: 'Firestore', status: 'unhealthy', detail: 'Status checks coming soon' },
                    { label: 'AI Proxy (Express)', status: 'unhealthy', detail: 'Status checks coming soon' },
                ]);
            } catch (err) {
                console.error('[AdminDashboard] stats load error:', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    const kpis = stats ? [
        { name: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users },
        { name: 'Active Jobs', value: stats.activeJobs.toLocaleString(), icon: Briefcase },
        { name: 'Total Applications', value: stats.totalApplications.toLocaleString(), icon: FileText },
    ] : [];

    return (
        <div className="space-y-8 font-sans">
            <div className="border-b border-slate-200 pb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Dashboard Overview</h2>
                <p className="text-xs font-medium text-slate-400">Super Admin Control Center · Live Data</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {kpis.map((stat) => (
                            <div key={stat.name} className="bg-white rounded-xl border border-slate-200 p-6 shadow-soft hover:shadow-soft-md hover:border-sky-200 transition-all duration-200">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-10 h-10 bg-sky-50 text-sky-700 rounded-lg flex items-center justify-center">
                                        <stat.icon size={20} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-slate-900 tabular-nums mb-1">{stat.value}</div>
                                <div className="text-xs font-medium text-slate-400">{stat.name}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6">
                            <h3 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <span className="w-2 h-2 bg-sky-600 rounded-full"></span>
                                Recent Registrations
                            </h3>
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-slate-400">No recent activity.</p>
                            ) : (
                                <div className="space-y-0">
                                    {recentActivity.map((item) => (
                                        <div key={item.id} className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
                                            <div className="w-2 h-2 mt-1.5 bg-sky-400 rounded-full flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{item.text}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-soft p-6">
                            <h3 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <span className="w-2 h-2 bg-sky-600 rounded-full"></span>
                                System Health
                            </h3>
                            <div className="space-y-5">
                                {healthStatuses.map((item) => (
                                    <div key={item.label} className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-medium">
                                            <span className="text-slate-600">{item.label}</span>
                                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                                                Placeholder
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
