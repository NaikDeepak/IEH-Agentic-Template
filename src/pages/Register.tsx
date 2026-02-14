import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useSearchParams } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowRight, Loader2, Gift } from 'lucide-react';

export const Register: React.FC = () => {
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

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-white font-sans">
            <div className="max-w-md w-full bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 relative">

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-2 h-2 bg-black"></div>
                    <div className="w-2 h-2 bg-black/50"></div>
                </div>

                <div className="text-center space-y-6 mb-10">
                    <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(128,128,128,1)] border-2 border-black">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-black uppercase tracking-tighter leading-none mb-2">Join The Hub</h2>
                        <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">Create your professional identity</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-xs font-mono font-bold text-black uppercase tracking-widest flex items-center gap-2">
                            <User className="w-3 h-3" /> Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="JOHN DOE"
                            className="w-full px-4 py-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all outline-none text-sm font-mono placeholder:text-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-mono font-bold text-black uppercase tracking-widest flex items-center gap-2">
                            <Mail className="w-3 h-3" /> Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="USER@EXAMPLE.COM"
                            className="w-full px-4 py-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all outline-none text-sm font-mono placeholder:text-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-mono font-bold text-black uppercase tracking-widest flex items-center gap-2">
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
                            className="w-full px-4 py-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all outline-none text-sm font-mono placeholder:text-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-xs font-mono font-bold text-black uppercase tracking-widest flex items-center gap-2">
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
                            className={`w-full px-4 py-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all outline-none text-sm font-mono placeholder:text-gray-400 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-600' : ''}`}
                        />
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="text-xs font-mono text-red-600 font-bold uppercase mt-1">Passwords do not match</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="referralCode" className="text-xs font-mono font-bold text-black uppercase tracking-widest flex items-center gap-2">
                            <Gift className="w-3 h-3" /> Referral Code (Optional)
                        </label>
                        <input
                            id="referralCode"
                            type="text"
                            name="referralCode"
                            value={formData.referralCode}
                            onChange={handleChange}
                            placeholder="IEH-XXXXXX"
                            className="w-full px-4 py-3 bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-0.5 transition-all outline-none text-sm font-mono placeholder:text-gray-400"
                        />
                    </div>

                    {(error ?? validationError) && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-mono font-bold uppercase tracking-wide border-2 border-red-600">
                            Error: {error ?? validationError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || (formData.confirmPassword !== '' && formData.password !== formData.confirmPassword)}
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 text-sm font-black uppercase tracking-widest text-white bg-black border-2 border-black hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Create Account</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative py-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Or</span>
                    </div>
                </div>

                <button
                    onClick={() => loginWithGoogle(formData.referralCode)}
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 text-xs font-bold font-mono uppercase tracking-wider text-black bg-white border-2 border-black hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all mb-8"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Register with Google
                </button>

                <div className="text-center pt-8 border-t-2 border-gray-100 mt-0">
                    <p className="text-gray-500 text-xs font-mono uppercase tracking-wide">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="text-black font-bold hover:underline decoration-2 underline-offset-4"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
