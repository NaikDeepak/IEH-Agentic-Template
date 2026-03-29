import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    User,
    Mail,
    Shield,
    Trash2,
    Check,
    Loader2,
    AlertTriangle,
    Pencil,
    X,
    KeyRound,
} from 'lucide-react';

const ROLE_LABEL: Record<string, string> = {
    seeker: 'Job Seeker',
    employer: 'Employer',
    admin: 'Admin',
};

export const SettingsPage: React.FC = () => {
    const { user, userData, updateDisplayName, verifyEmailUpdate, deleteAccount, resetPassword, logout, clearError, error: authError } = useAuth();
    const navigate = useNavigate();

    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(user?.displayName ?? '');

    // Keep nameValue in sync if user.displayName loads/changes after mount (e.g. late auth resolution)
    useEffect(() => {
        if (!editingName) setNameValue(user?.displayName ?? '');
    }, [user?.displayName, editingName]);
    const [nameLoading, setNameLoading] = useState(false);
    const [nameSuccess, setNameSuccess] = useState(false);
    const nameSuccessTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (nameSuccessTimer.current) clearTimeout(nameSuccessTimer.current); }, []);

    const [resetLoading, setResetLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    const [emailEditing, setEmailEditing] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const [deletePhase, setDeletePhase] = useState<'idle' | 'confirm'>('idle');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [localError, setLocalError] = useState<string | null>(null);
    const displayError = localError ?? authError;

    const handleSaveName = async () => {
        const trimmed = nameValue.trim();
        if (!trimmed || trimmed === user?.displayName) {
            setEditingName(false);
            return;
        }
        setNameLoading(true);
        setLocalError(null);
        try {
            await updateDisplayName(trimmed);
            setNameSuccess(true);
            setEditingName(false);
            nameSuccessTimer.current = setTimeout(() => { setNameSuccess(false); }, 3000);
        } catch {
            // authError synced via useEffect
        } finally {
            setNameLoading(false);
        }
    };

    const handleEmailUpdate = async () => {
        const trimmed = newEmail.trim();
        if (!trimmed || trimmed === user?.email) return;
        setEmailLoading(true);
        setLocalError(null);
        clearError();
        try {
            await verifyEmailUpdate(trimmed);
            setEmailSent(true);
            setEmailEditing(false);
            setNewEmail('');
        } catch {
            // authError synced via useEffect
        } finally {
            setEmailLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        setResetLoading(true);
        setLocalError(null);
        clearError();
        try {
            await resetPassword(user.email);
            setResetSent(true);
        } catch {
            // authError synced via useEffect
        } finally {
            setResetLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        setLocalError(null);
        clearError();
        try {
            await deleteAccount();
            await logout();
            void navigate('/');
        } catch {
            // authError synced via useEffect (e.g. auth/requires-recent-login)
            setDeletePhase('idle');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 md:px-8 py-10 max-w-2xl">
                <div className="mb-8 border-b border-slate-200 pb-6">
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">My Account</span>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1">Settings</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Manage your account preferences</p>
                </div>

                {displayError && (
                    <div className="mb-6 p-4 rounded-xl border border-red-100 bg-red-50 flex items-center gap-3 text-sm text-red-600">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {displayError}
                    </div>
                )}

                {/* Account Info */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 mb-5">
                    <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-sky-600" />
                        Account Info
                    </h2>
                    <div className="space-y-4">
                        {/* Display Name */}
                        <div>
                            <label htmlFor="displayName" className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5">
                                Display Name
                            </label>
                            {editingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        id="displayName"
                                        type="text"
                                        value={nameValue}
                                        onChange={(e) => { setNameValue(e.target.value); }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { void handleSaveName(); }
                                            if (e.key === 'Escape') { setEditingName(false); setNameValue(user?.displayName ?? ''); }
                                        }}
                                        className="flex-grow px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all"
                                        // eslint-disable-next-line jsx-a11y/no-autofocus
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => { void handleSaveName(); }}
                                        disabled={nameLoading}
                                        className="flex items-center justify-center w-9 h-9 bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {nameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => { setEditingName(false); setNameValue(user?.displayName ?? ''); }}
                                        className="flex items-center justify-center w-9 h-9 border border-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-800 font-medium">
                                        {nameSuccess && <Check className="w-3.5 h-3.5 text-emerald-500 inline mr-1.5" />}
                                        {user?.displayName ?? '—'}
                                    </span>
                                    <button
                                        onClick={() => { setEditingName(true); setNameValue(user?.displayName ?? ''); }}
                                        className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 font-medium transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <div className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Mail className="w-3 h-3" /> Email
                            </div>
                            {emailSent ? (
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
                                    <Check className="w-4 h-4 shrink-0" />
                                    Verification link sent to your new email. Click it to confirm the change.
                                </div>
                            ) : emailEditing ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => { setNewEmail(e.target.value); }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') { void handleEmailUpdate(); }
                                                if (e.key === 'Escape') { setEmailEditing(false); setNewEmail(''); }
                                            }}
                                            placeholder="New email address"
                                            className="flex-grow px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                            // eslint-disable-next-line jsx-a11y/no-autofocus
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => { void handleEmailUpdate(); }}
                                            disabled={emailLoading || !newEmail.trim()}
                                            className="flex items-center justify-center w-9 h-9 bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => { setEmailEditing(false); setNewEmail(''); }}
                                            className="flex items-center justify-center w-9 h-9 border border-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400">A verification link will be sent to the new address. Your email won't change until you click it.</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-800">{user?.email ?? '—'}</span>
                                    <button
                                        onClick={() => { setEmailEditing(true); }}
                                        className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 font-medium transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        Change
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <div className="block text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5">
                                Role
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-sky-50 border border-sky-100 rounded-full text-xs font-semibold text-sky-700">
                                {userData?.role ? ROLE_LABEL[userData.role] : '—'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 mb-5">
                    <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-sky-600" />
                        Security
                    </h2>
                    <div>
                        <p className="text-sm text-slate-500 mb-4">
                            We'll send a password reset link to <span className="font-medium text-slate-700">{user?.email}</span>.
                        </p>
                        {resetSent ? (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
                                <Check className="w-4 h-4 shrink-0" />
                                Reset link sent — check your inbox.
                            </div>
                        ) : (
                            <button
                                onClick={() => { void handlePasswordReset(); }}
                                disabled={resetLoading}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                                Send Password Reset Email
                            </button>
                        )}
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-white rounded-2xl border border-red-100 shadow-soft p-6">
                    <h2 className="text-sm font-semibold text-red-600 mb-4 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Danger Zone
                    </h2>
                    {deletePhase === 'idle' ? (
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-800">Delete Account</p>
                                <p className="text-xs text-slate-400 mt-0.5">Permanently remove your account credentials and profile.</p>
                            </div>
                            <button
                                onClick={() => { setDeletePhase('confirm'); }}
                                className="shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">
                                    This action is <span className="font-bold">permanent and irreversible</span>. Your account credentials and profile will be deleted. Application history may be retained for employer records.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { void handleDelete(); }}
                                    disabled={deleteLoading}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Yes, Delete My Account
                                </button>
                                <button
                                    onClick={() => { setDeletePhase('idle'); setLocalError(null); }}
                                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </section>
        </div>
    );
};
