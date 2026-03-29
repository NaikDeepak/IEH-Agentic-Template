import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Users, Search, Loader2, ShieldCheck, Briefcase, User,
    RefreshCw, ChevronDown,
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, orderBy, query, Timestamp, limit, startAfter, type QueryDocumentSnapshot } from 'firebase/firestore';
import type { UserData } from '../../context/AuthContext';

type UserRow = UserData & { createdAt?: Timestamp };

const ROLE_LABEL: Record<string, string> = {
    seeker: 'Job Seeker',
    employer: 'Employer',
    admin: 'Admin',
};

const ROLE_BADGE: Record<string, string> = {
    seeker: 'bg-sky-50 text-sky-700 border-sky-100',
    employer: 'bg-violet-50 text-violet-700 border-violet-100',
    admin: 'bg-amber-50 text-amber-700 border-amber-100',
};

const PAGE_SIZE = 50;

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'seeker' | 'employer' | 'admin'>('all');
    const [loadError, setLoadError] = useState<string | null>(null);
    const lastVisibleDocRef = useRef<QueryDocumentSnapshot | null>(null);
    const [isLastPage, setIsLastPage] = useState(false);

    const load = useCallback(async (append = false) => {
        setLoading(true);
        setLoadError(null);
        try {
            let usersQuery = query(
                collection(db, 'users'),
                orderBy('createdAt', 'desc'),
                limit(PAGE_SIZE),
            );
            if (append && lastVisibleDocRef.current) {
                usersQuery = query(
                    collection(db, 'users'),
                    orderBy('createdAt', 'desc'),
                    startAfter(lastVisibleDocRef.current),
                    limit(PAGE_SIZE),
                );
            }

            const snap = await getDocs(usersQuery);
            const newRows = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserRow));
            setUsers(prev => append ? [...prev, ...newRows] : newRows);
            lastVisibleDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
            setIsLastPage(snap.docs.length < PAGE_SIZE);
        } catch (err) {
            console.error('[AdminUsersPage] load error:', err);
            setLoadError('Failed to load users. Please retry.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(false); }, [load]);

    const filtered = users.filter(u => {
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        const term = search.toLowerCase();
        const matchSearch = !term
            || (u.displayName ?? '').toLowerCase().includes(term)
            || (u.email ?? '').toLowerCase().includes(term);
        return matchRole && matchSearch;
    });

    return (
        <div className="space-y-6 font-sans">
            <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest block mb-1">Admin</span>
                    <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{users.length} total accounts</p>
                </div>
                <button
                    onClick={() => { void load(false); }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); }}
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    />
                </div>
                <div className="relative">
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value as typeof roleFilter); }}
                        className="pl-4 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all appearance-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="seeker">Job Seekers</option>
                        <option value="employer">Employers</option>
                        <option value="admin">Admins</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
                    <p className="text-sm text-slate-400">Loading users...</p>
                </div>
            ) : loadError ? (
                <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
                    <p className="text-red-600 font-semibold">{loadError}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-semibold">No users found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">User</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">Role</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest hidden md:table-cell">Verified</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.uid} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                                                {u.role === 'employer'
                                                    ? <Briefcase className="w-3.5 h-3.5 text-violet-600" />
                                                    : u.role === 'admin'
                                                        ? <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                                        : <User className="w-3.5 h-3.5 text-sky-600" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 leading-tight">{u.displayName ?? '—'}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{u.email ?? '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex px-2.5 py-0.5 text-[11px] font-semibold rounded-full border capitalize ${ROLE_BADGE[u.role ?? ''] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {u.role ? ROLE_LABEL[u.role] : 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 hidden md:table-cell">
                                        {u.phoneVerified
                                            ? <span className="text-xs text-emerald-600 font-medium">Phone ✓</span>
                                            : <span className="text-xs text-slate-300">—</span>
                                        }
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-slate-400 hidden lg:table-cell">
                                        {u.createdAt instanceof Timestamp
                                            ? u.createdAt.toDate().toLocaleDateString()
                                            : '—'
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!isLastPage && (
                        <div className="p-4 border-t border-slate-100 text-center">
                            <button
                                onClick={() => { void load(true); }}
                                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
