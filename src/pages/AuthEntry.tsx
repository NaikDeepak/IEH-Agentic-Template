import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Search, ArrowRight } from 'lucide-react';

interface AuthEntryProps {
    mode: 'login' | 'register';
}

export const AuthEntry: React.FC<AuthEntryProps> = ({ mode }) => {
    const navigate = useNavigate();

    const heading = mode === 'login' ? 'Welcome back' : 'Join WorkMila';
    const subheading =
        mode === 'login'
            ? 'Sign in to your account'
            : 'Create your account to get started';

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-sky-50 font-sans">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-10">
                    <div className="w-14 h-14 bg-sky-700 text-white rounded-xl flex items-center justify-center mx-auto shadow-sm mb-4">
                        <span className="font-bold text-lg tracking-tight">WM</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">{heading}</h1>
                    <p className="text-slate-400 mt-2 text-sm">{subheading}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Seeker card */}
                    <button
                        onClick={() => void navigate(`/${mode}/seeker`)}
                        className="group bg-white border border-slate-200 rounded-2xl p-8 text-left hover:border-sky-400 hover:shadow-md transition-all"
                    >
                        <div className="w-12 h-12 bg-sky-50 text-sky-700 rounded-xl flex items-center justify-center mb-5 group-hover:bg-sky-100 transition-colors">
                            <Search className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">I'm a Job Seeker</h2>
                        <p className="text-sm text-slate-400 mb-6">
                            Find your next opportunity, analyse your skills, and track applications.
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 group-hover:gap-2.5 transition-all">
                            {mode === 'login' ? 'Sign in as Seeker' : 'Register as Seeker'}
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </button>

                    {/* Employer card */}
                    <button
                        onClick={() => void navigate(`/${mode}/employer`)}
                        className="group bg-white border border-slate-200 rounded-2xl p-8 text-left hover:border-violet-400 hover:shadow-md transition-all"
                    >
                        <div className="w-12 h-12 bg-violet-50 text-violet-700 rounded-xl flex items-center justify-center mb-5 group-hover:bg-violet-100 transition-colors">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">I'm an Employer</h2>
                        <p className="text-sm text-slate-400 mb-6">
                            Post jobs, search talent, and manage your hiring pipeline.
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 group-hover:gap-2.5 transition-all">
                            {mode === 'login' ? 'Sign in as Employer' : 'Register as Employer'}
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </button>
                </div>

                <p className="text-center text-sm text-slate-400 mt-8">
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-sky-700 font-semibold hover:text-sky-800 transition-colors"
                            >
                                Create Account
                            </Link>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-sky-700 font-semibold hover:text-sky-800 transition-colors"
                            >
                                Sign In
                            </Link>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};
