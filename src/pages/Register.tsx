import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useSearchParams } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowRight, Loader2, Gift } from 'lucide-react';

interface RegisterProps {
    role?: 'seeker' | 'employer';
}

const ROLE_COPY = {
    seeker: {
        heading: 'Start your job search',
        subheading: 'Create your seeker profile and find your next role',
        backTo: '/register',
    },
    employer: {
        heading: 'Start hiring today',
        subheading: 'Post jobs and connect with top talent',
        backTo: '/register',
    },
};

export const Register: React.FC<RegisterProps> = ({ role }) => {
    const copy = role ? ROLE_COPY[role] : { heading: 'Join WorkMila', subheading: 'Create your professional identity', backTo: null };
    const { signupWithEmail, loginWithGoogle, error, clearError } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralCode: searchParams.get('ref') ?? ''
    });

    const [validationError, setValidationError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) clearError();
        if (validationError) setValidationError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        setValidationError(null);
        setIsLoading(true);
        try {
            await signupWithEmail(formData.email, formData.password, formData.name, formData.referralCode);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all text-sm text-slate-900 placeholder:text-slate-400";
    const labelClasses = "text-xs font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1.5";

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-sky-50 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-soft p-8 md:p-10">

                <div className="text-center space-y-4 mb-8">
                    <div className="w-14 h-14 bg-sky-700 text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
                        <UserPlus className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{copy.heading}</h2>
                        <p className="text-sm text-slate-400">{copy.subheading}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className={labelClasses}>
                            <User className="w-3 h-3" /> Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={inputClasses}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="email" className={labelClasses}>
                            <Mail className="w-3 h-3" /> Email Address
                        </label>
                        <input
                            id="email"
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
                        <label htmlFor="password" className={labelClasses}>
                            <Lock className="w-3 h-3" /> Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={inputClasses}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className={labelClasses}>
                            <Lock className="w-3 h-3" /> Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className={`${inputClasses} ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}`}
                        />
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="referralCode" className={labelClasses}>
                            <Gift className="w-3 h-3" /> Referral Code <span className="text-slate-300 font-normal normal-case">(optional)</span>
                        </label>
                        <input
                            id="referralCode"
                            type="text"
                            name="referralCode"
                            value={formData.referralCode}
                            onChange={handleChange}
                            placeholder="WM-XXXXXX"
                            className={inputClasses}
                        />
                    </div>

                    {(error ?? validationError) && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
                            {error ?? validationError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || (formData.confirmPassword !== '' && formData.password !== formData.confirmPassword)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Create Account</span>
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
                    onClick={() => loginWithGoogle(formData.referralCode)}
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
                        Already have an account?{' '}
                        <Link
                            to={role ? `/login/${role}` : '/login'}
                            className="text-sky-700 font-semibold hover:text-sky-800 transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>
                    {copy.backTo && (
                        <p className="text-xs">
                            <Link to={copy.backTo} className="text-slate-400 hover:text-slate-600 transition-colors">
                                &larr; Back
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
