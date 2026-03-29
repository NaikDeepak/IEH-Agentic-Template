import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../components/Header';
import { JobAlertsService, type JobAlert } from '../../features/notifications/jobAlertsService';
import {
    Bell, Plus, Trash2, ToggleLeft, ToggleRight,
    Loader2, Search, MapPin, Briefcase, AlertCircle,
} from 'lucide-react';

const JOB_TYPES = [
    { value: '', label: 'Any type' },
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
];

const JobAlertsPage: React.FC = () => {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<JobAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    // Form state
    const [keywords, setKeywords] = useState('');
    const [location, setLocation] = useState('');
    const [jobType, setJobType] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            try {
                const data = await JobAlertsService.getAlerts(user.uid);
                setAlerts(data);
            } catch (err) {
                console.error('[JobAlertsPage] load error:', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!keywords.trim()) {
            setFormError('Keywords are required.');
            return;
        }
        setCreating(true);
        setFormError(null);
        setActionError(null);
        try {
            await JobAlertsService.createAlert(user.uid, keywords, location, jobType);
            const latest = await JobAlertsService.getAlerts(user.uid);
            setAlerts(latest);
            setKeywords('');
            setLocation('');
            setJobType('');
            setShowForm(false);
        } catch (err) {
            console.error('[JobAlertsPage] create error:', err);
            setFormError('Failed to create alert. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleToggle = async (alert: JobAlert) => {
        const originalActive = alert.active;
        setActionError(null);
        setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, active: !originalActive } : a));
        try {
            await JobAlertsService.toggleAlert(alert.id, !originalActive);
        } catch (err) {
            console.error('[JobAlertsPage] toggle error:', err);
            setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, active: originalActive } : a));
            setActionError('Failed to update alert status. Please try again.');
        }
    };

    const handleDelete = async (alertId: string) => {
        const confirmed = window.confirm('Delete this alert?');
        if (!confirmed) return;
        setActionError(null);
        try {
            await JobAlertsService.deleteAlert(alertId);
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        } catch (err) {
            console.error('[JobAlertsPage] delete error:', err);
            setActionError('Failed to delete alert. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-2xl">
                {/* Header */}
                <div className="border-b border-slate-200 pb-8 mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                        <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-1 block">Seeker</span>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <Bell className="w-7 h-7 text-sky-700" />
                            Job Alerts
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">Get notified when new jobs match your criteria</p>
                    </div>
                    {!showForm && (
                        <button
                            onClick={() => { setShowForm(true); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            <Plus className="w-4 h-4" /> New Alert
                        </button>
                    )}
                </div>

                {/* Create form */}
                {showForm && (
                    <form
                        onSubmit={(e) => { void handleCreate(e); }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 mb-8"
                    >
                        <h2 className="text-sm font-semibold text-slate-900 mb-5">New Job Alert</h2>

                        {formError && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {formError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="alert-keywords" className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5 block">
                                    Keywords <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="alert-keywords"
                                        type="text"
                                        value={keywords}
                                        onChange={(e) => { setKeywords(e.target.value); }}
                                        placeholder="e.g. React, Frontend, Node.js"
                                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="alert-location" className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5 block">
                                    Location
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        id="alert-location"
                                        type="text"
                                        value={location}
                                        onChange={(e) => { setLocation(e.target.value); }}
                                        placeholder="e.g. Bangalore, Mumbai, Remote"
                                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="alert-jobtype" className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5 block">
                                    Job Type
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        id="alert-jobtype"
                                        value={jobType}
                                        onChange={(e) => { setJobType(e.target.value); }}
                                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all appearance-none"
                                    >
                                        {JOB_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="submit"
                                disabled={creating}
                                className="flex items-center gap-2 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                                Create Alert
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setFormError(null); }}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Alerts list */}
                {actionError && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {actionError}
                    </div>
                )}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                        <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-semibold mb-1">No alerts yet</p>
                        <p className="text-sm text-slate-400">Create an alert and we'll notify you when matching jobs are posted.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {alerts.map(alert => (
                            <div
                                key={alert.id}
                                className={`bg-white rounded-2xl border p-5 shadow-soft transition-all ${
                                    alert.active ? 'border-slate-200' : 'border-slate-100 opacity-60'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                                                <Search className="w-3.5 h-3.5 text-sky-600" />
                                                {alert.keywords}
                                            </span>
                                            {alert.active ? (
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>
                                            ) : (
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Paused</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                            {alert.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {alert.location}
                                                </span>
                                            )}
                                            {alert.jobType && (
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3" />
                                                    {JOB_TYPES.find(t => t.value === alert.jobType)?.label ?? alert.jobType}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => { void handleToggle(alert); }}
                                            title={alert.active ? 'Pause alert' : 'Activate alert'}
                                            className="p-1.5 text-slate-400 hover:text-sky-700 transition-colors"
                                        >
                                            {alert.active
                                                ? <ToggleRight className="w-6 h-6 text-sky-600" />
                                                : <ToggleLeft className="w-6 h-6 text-slate-300" />
                                            }
                                        </button>
                                        <button
                                            onClick={() => { void handleDelete(alert.id); }}
                                            title="Delete alert"
                                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default JobAlertsPage;
