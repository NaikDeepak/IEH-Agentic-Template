import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Mail, CheckCircle, Loader2, RefreshCw, LogOut } from 'lucide-react';
import * as Sentry from '@sentry/react';
import { useAuth } from '../hooks/useAuth';

export const VerifyEmail: React.FC = () => {
    const { user, loading, sendVerificationEmail, logout, error, clearError } = useAuth();
    const navigate = useNavigate();
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSent, setResendSent] = useState(false);
    const [checkLoading, setCheckLoading] = useState(false);

    if (!loading && !user) {
        return <Navigate to="/login" replace />;
    }

    const handleResend = async () => {
        setResendLoading(true);
        setResendSent(false);
        clearError();
        try {
            await sendVerificationEmail();
            setResendSent(true);
        } catch (error) {
            Sentry.captureException(error);
            console.error('Failed to resend verification email:', error);
            // error set in AuthProvider
        } finally {
            setResendLoading(false);
        }
    };

    const handleCheckVerified = async () => {
        setCheckLoading(true);
        try {
            await user?.reload();
            // After reload, if verified, ProtectedRoute will unblock automatically.
            // Navigate to dashboard to trigger the re-check.
            void navigate('/dashboard');
        } catch (error) {
            Sentry.captureException(error);
            console.error('Failed to reload user:', error);
        } finally {
            setCheckLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            Sentry.captureException(error);
            console.error('Failed to logout:', error);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-sky-50 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-soft p-8 md:p-10">
                <div className="text-center space-y-4 mb-8">
                    <div className="w-14 h-14 bg-sky-700 text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
                        <Mail className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Verify your email</h2>
                        <p className="text-sm text-slate-400">
                            We sent a verification link to
                        </p>
                        <p className="text-sm font-semibold text-slate-700 mt-1">{user?.email}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-sm text-slate-500 text-center">
                        Click the link in the email to activate your account. Check your spam folder if you don't see it.
                    </p>

                    {resendSent && !error && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            Verification email resent successfully.
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={() => void handleCheckVerified()}
                        disabled={checkLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {checkLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                I've verified my email
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => void handleResend()}
                        disabled={resendLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resendLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Resend verification email
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <button
                        onClick={() => void handleLogout()}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out and use a different account
                    </button>
                </div>
            </div>
        </div>
    );
};
