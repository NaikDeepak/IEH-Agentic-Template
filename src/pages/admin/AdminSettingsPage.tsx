import React, { useEffect, useState } from 'react';
import {
    Settings, Save, Loader2, Check, AlertTriangle,
    ToggleLeft, ToggleRight, Percent,
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface PlatformConfig {
    platformFeePercent: number;
    featureFlags: {
        referralEnabled: boolean;
        aiMatchingEnabled: boolean;
        browniePointsEnabled: boolean;
        emailVerificationRequired: boolean;
    };
}

const DEFAULT_CONFIG: PlatformConfig = {
    platformFeePercent: 10,
    featureFlags: {
        referralEnabled: true,
        aiMatchingEnabled: true,
        browniePointsEnabled: true,
        emailVerificationRequired: true,
    },
};

const CONFIG_DOC = 'config/platform';

const AdminSettingsPage: React.FC = () => {
    const [config, setConfig] = useState<PlatformConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const snap = await getDoc(doc(db, CONFIG_DOC));
                if (snap.exists()) {
                    setConfig(snap.data() as PlatformConfig);
                }
            } catch (err) {
                console.error('[AdminSettingsPage] load error:', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await setDoc(doc(db, CONFIG_DOC), config);
            setSuccess(true);
            setTimeout(() => { setSuccess(false); }, 3000);
        } catch (err) {
            console.error('[AdminSettingsPage] save error:', err);
            setError('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const toggleFlag = (flag: keyof PlatformConfig['featureFlags']) => {
        setConfig(prev => ({
            ...prev,
            featureFlags: { ...prev.featureFlags, [flag]: !prev.featureFlags[flag] },
        }));
    };

    const FLAG_META: { key: keyof PlatformConfig['featureFlags']; label: string; description: string }[] = [
        { key: 'referralEnabled', label: 'Referral Program', description: 'Allow users to share referral codes and earn Brownie Points' },
        { key: 'aiMatchingEnabled', label: 'AI Job Matching', description: 'Enable semantic job matching and daily shortlists for seekers' },
        { key: 'browniePointsEnabled', label: 'Brownie Points', description: 'Enable the gamification points ledger across the platform' },
        { key: 'emailVerificationRequired', label: 'Email Verification Required', description: 'Block access until users verify their email address' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans max-w-2xl">
            <div className="border-b border-slate-200 pb-6">
                <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest block mb-1">Admin</span>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-sky-700" />
                    Platform Settings
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Configure platform-wide settings and feature flags</p>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-red-100 bg-red-50 flex items-center gap-3 text-sm text-red-600">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50 flex items-center gap-2 text-sm text-emerald-700">
                    <Check className="w-4 h-4 shrink-0" />
                    Settings saved successfully.
                </div>
            )}

            {/* Platform fee */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-sky-600" />
                    Platform Fee
                </h3>
                <div>
                    <label htmlFor="feePercent" className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5 block">
                        Fee Percentage (%)
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            id="feePercent"
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={config.platformFeePercent}
                            onChange={(e) => { setConfig(prev => ({ ...prev, platformFeePercent: Number(e.target.value) })); }}
                            className="w-32 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                        />
                        <span className="text-sm text-slate-500">% of transaction value</span>
                    </div>
                </div>
            </section>

            {/* Feature flags */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-5 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-sky-600" />
                    Feature Flags
                </h3>
                <div className="space-y-4">
                    {FLAG_META.map(({ key, label, description }) => (
                        <div key={key} className="flex items-center justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{label}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                            </div>
                            <button
                                onClick={() => { toggleFlag(key); }}
                                className={`shrink-0 transition-colors ${config.featureFlags[key] ? 'text-sky-600' : 'text-slate-300'}`}
                                aria-label={`Toggle ${label}`}
                            >
                                {config.featureFlags[key]
                                    ? <ToggleRight className="w-8 h-8" />
                                    : <ToggleLeft className="w-8 h-8" />
                                }
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <button
                onClick={() => { void handleSave(); }}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-sky-700 hover:bg-sky-800 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Settings
            </button>
        </div>
    );
};

export default AdminSettingsPage;
