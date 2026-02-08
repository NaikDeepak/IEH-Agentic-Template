import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export const Register: React.FC = () => {
    const { signupWithEmail, error, clearError } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
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
            await signupWithEmail(formData.email, formData.password, formData.name);
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

                <div className="text-center pt-8 border-t-2 border-gray-100 mt-8">
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
