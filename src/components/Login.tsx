import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, User, LogOut } from 'lucide-react';

interface LoginProps {
    variant?: 'card' | 'navbar';
}

export const Login: React.FC<LoginProps> = ({ variant = 'card' }) => {
    const { loginWithGoogle, user, loading, logout } = useAuth();

    if (loading) {
        return (
            <div className={variant === 'navbar' ? 'h-9 w-9 flex items-center justify-center' : 'flex items-center justify-center min-h-[200px]'}>
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (variant === 'navbar') {
        if (!user) {
            return (
                <button
                    onClick={loginWithGoogle}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                </button>
            );
        }

        return (
            <div className="flex items-center gap-3 bg-gray-50 pr-1 pl-3 py-1 rounded-full border border-gray-100">
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.displayName?.split(' ')[0]}
                </span>
                <button
                    onClick={logout}
                    title="Sign Out"
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // Default Card Variant
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white p-8 rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 max-w-md w-full mx-auto">
            <div className="space-y-8 text-center">
                <div className="space-y-2">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {user ? <User className="w-8 h-8" /> : <LogIn className="w-8 h-8" />}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {user ? `Welcome back, ${user.displayName?.split(' ')[0]}` : 'Start Your Journey'}
                    </h2>
                    <p className="text-gray-500 text-sm max-w-[280px] mx-auto">
                        {user
                            ? 'Maximize your career growth with AI-powered insights and a responsive network.'
                            : 'Sign in to access premium job matches and AI interview preparation tools.'}
                    </p>
                </div>

                <div className="space-y-4">
                    {!user ? (
                        <button
                            onClick={loginWithGoogle}
                            className="group relative w-full flex items-center justify-center gap-3 py-3 px-6 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-100"
                        >
                            <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            Sign in with Google
                        </button>
                    ) : (
                        <button
                            onClick={logout}
                            className="w-full py-3 px-6 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all border border-gray-100"
                        >
                            Sign Out from Account
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
