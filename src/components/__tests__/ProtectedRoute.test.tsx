import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

describe('ProtectedRoute', () => {
    const defaultAuthContext = {
        user: null,
        userData: null,
        loading: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderProtectedRoute = (allowedRoles?: ('seeker' | 'employer' | 'admin')[]) => {
        return render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute allowedRoles={allowedRoles}>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/" element={<div>Home Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('shows loading spinner when loading is true', () => {
        (useAuth as Mock).mockReturnValue({ ...defaultAuthContext, loading: true });
        const { container } = renderProtectedRoute();
        // Check for the loading spinner div structure
        expect(container.getElementsByClassName('animate-spin')).toHaveLength(1);
    });

    it('redirects to login when user is not authenticated', () => {
        (useAuth as Mock).mockReturnValue({ ...defaultAuthContext, user: null, loading: false });
        renderProtectedRoute();
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders children when authenticated and no roles defined', () => {
        (useAuth as Mock).mockReturnValue({
            ...defaultAuthContext,
            user: { uid: '123' },
            userData: { role: 'seeker' },
            loading: false
        });
        renderProtectedRoute();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('renders children when authenticated and role matches', () => {
        (useAuth as Mock).mockReturnValue({
            ...defaultAuthContext,
            user: { uid: '123' },
            userData: { role: 'employer' },
            loading: false
        });
        renderProtectedRoute(['employer']);
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to home when authenticated but role mismatches', () => {
        (useAuth as Mock).mockReturnValue({
            ...defaultAuthContext,
            user: { uid: '123' },
            userData: { role: 'seeker' },
            loading: false
        });
        renderProtectedRoute(['employer']);
        expect(screen.getByText('Home Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});
