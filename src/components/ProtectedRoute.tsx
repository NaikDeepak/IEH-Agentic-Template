import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('seeker' | 'employer' | 'admin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, userData, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sky-50 flex-col gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-sky-700 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm tracking-tight">WM</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">WorkMila</span>
                </div>
                <div className="w-8 h-8 border-2 border-sky-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save the current location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Block email/password users who haven't verified their email yet.
    // Google sign-in users are always pre-verified by Google.
    if (!user.emailVerified && user.providerData.some(p => p.providerId === 'password')) {
        return <Navigate to="/verify-email" replace />;
    }

    if (allowedRoles && userData?.role && !allowedRoles.includes(userData.role)) {
        // Logged in but has the WRONG role
        return <Navigate to="/" replace />;
    }

    // Role selection is now global and will block interaction if missing,
    // so we don't need to redirect here if role is simply null.

    return <>{children}</>;
};
