import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, Mail, Lock, Loader2, ArrowRight, ChevronDown, User, Settings, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

interface LoginProps {
    variant?: 'card' | 'navbar';
    role?: 'seeker' | 'employer';
}

const ROLE_COPY = {
    seeker: {
        heading: 'Welcome back',
        subheading: 'Sign in to find your next opportunity',
        backLabel: 'Back',
        backTo: '/login',
    },
    employer: {
        heading: 'Welcome back',
        subheading: 'Sign in to find top talent',
        backLabel: 'Back',
        backTo: '/login',
    },
};

export const Login: React.FC<LoginProps> = ({ variant = 'card', role }) => {
    const copy = role ? ROLE_COPY[role] : { heading: 'Welcome back', subheading: 'Sign in to your WorkMila account', backLabel: null, backTo: null };
    const { loginWithGoogle, loginWithEmail, resetPassword, user, loading, logout, error, clearError } = useAuth();
    const [searchParams] = useSearchParams();
    const referralCode = searchParams.get('ref') ?? undefined;
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSent, setForgotSent] = useState(false);
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) clearError();
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsForgotLoading(true);
        try {
            await resetPassword(forgotEmail);
            setForgotSent(true);
        } catch {
            // error set in AuthProvider
        } finally {
            setIsForgotLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEmailLoading(true);
        try {
            await loginWithEmail(formData.email, formData.password);
        } catch (err) {
            console.error(err);
        } finally {
            setIsEmailLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={variant === 'navbar' ? 'h-9 w-9 flex items-center justify-center' : 'flex items-center justify-center min-h-[200px]'}>
                <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (variant === 'navbar') {
        if (!user) {
            return (
                <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors"
                >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                </Link>
            );
        }

        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => { setDropdownOpen(prev => !prev); }}
                    className="flex items-center gap-2 bg-white pl-3 pr-2 py-1 border border-slate-200 rounded-xl shadow-soft hover:bg-slate-50 transition-colors"
                >
                    <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                        {user.displayName?.split(' ')[0] ?? user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-soft-md py-1 z-50">
                        <button
                            onClick={() => { void navigate('/profile'); setDropdownOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <User className="w-4 h-4 text-slate-400" />
                            Profile
                        </button>
                        <button
                            onClick={() => { void navigate('/settings'); setDropdownOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Settings className="w-4 h-4 text-slate-400" />
                            Settings
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                            onClick={() => { void logout(); setDropdownOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        );
    }

    const inputClasses = "w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all text-sm text-slate-900 placeholder:text-slate-400";
    const labelClasses = "text-xs font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1.5";

    // Card Variant — Forgot Password mode
    if (forgotMode) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4 bg-sky-50 w-full font-sans">
                <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-soft p-8 md:p-10">
                    <div className="text-center space-y-4 mb-8">
                        <div className="w-14 h-14 bg-sky-700 text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
                            <Mail className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset Password</h2>
                            <p className="text-sm text-slate-400">We'll send a reset link to your email</p>
                        </div>
                    </div>

                    {forgotSent ? (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-3 p-5 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                                <p className="text-sm font-medium text-emerald-800">Reset link sent to <span className="font-bold">{forgotEmail}</span></p>
                                <p className="text-xs text-emerald-600">Check your inbox and follow the link to reset your password.</p>
                            </div>
                            <button
                                onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }}
                                className="w-full py-3 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-5">
                            <div className="space-y-1.5">
                                <label htmlFor="forgot-email" className={labelClasses}>
                                    <Mail className="w-3 h-3" /> Email Address
                                </label>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    required
                                    value={forgotEmail}
                                    onChange={(e) => { setForgotEmail(e.target.value); }}
                                    placeholder="you@example.com"
                                    className={inputClasses}
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isForgotLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isForgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setForgotMode(false); clearError(); }}
                                className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                Back to Sign In
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    // Card Variant
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-sky-50 w-full font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-soft p-8 md:p-10">

                <div className="text-center space-y-4 mb-8">
                    <div className="w-14 h-14 bg-sky-700 text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
                        <LogIn className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{copy.heading}</h2>
                        <p className="text-sm text-slate-400">{copy.subheading}</p>
                    </div>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="login-email" className={labelClasses}>
                            <Mail className="w-3 h-3" /> Email Address
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className={inputClasses}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="login-password" className={labelClasses}>
                                <Lock className="w-3 h-3" /> Password
                            </label>
                            <button
                                type="button"
                                onClick={() => { setForgotMode(true); clearError(); }}
                                className="text-xs text-sky-600 hover:text-sky-800 font-medium transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <input
                            id="login-password"
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={inputClasses}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isEmailLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isEmailLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative py-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-xs text-slate-400">or</span>
                    </div>
                </div>

                <button
                    onClick={() => loginWithGoogle(referralCode)}
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors mb-6"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className="text-center pt-6 border-t border-slate-100 space-y-2">
                    <p className="text-slate-500 text-sm">
                        Don't have an account?{' '}
                        <Link
                            to={role ? `/register/${role}` : '/register'}
                            className="text-sky-700 font-semibold hover:text-sky-800 transition-colors"
                        >
                            Create Account
                        </Link>
                    </p>
                    {copy.backTo && (
                        <p className="text-xs">
                            <Link to={copy.backTo} className="text-slate-400 hover:text-slate-600 transition-colors">
                                &larr; {copy.backLabel}
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
