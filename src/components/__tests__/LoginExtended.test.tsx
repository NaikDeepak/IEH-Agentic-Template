/**
 * Additional Login tests for branches not covered by tests/components/Login.test.tsx:
 * - loading state
 * - navbar variant (logged out / logged in)
 * - dropdown navigation
 * - role prop (seeker/employer)
 * - handleEmailLogin
 * - handleChange clears error
 * - Back to Sign In from success state
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../Login';

vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

import { useAuth } from '../../hooks/useAuth';

const mockLoginWithEmail = vi.fn();
const mockLoginWithGoogle = vi.fn();
const mockLogout = vi.fn();
const mockClearError = vi.fn();
const mockResetPassword = vi.fn();

const baseAuth = {
    user: null,
    userData: null,
    loading: false,
    error: null,
    loginWithEmail: mockLoginWithEmail,
    loginWithGoogle: mockLoginWithGoogle,
    logout: mockLogout,
    resetPassword: mockResetPassword,
    clearError: mockClearError,
};

describe('Login — extended coverage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue(baseAuth);
    });

    it('shows loading spinner when loading is true (card variant)', () => {
        (useAuth as any).mockReturnValue({ ...baseAuth, loading: true });
        const { container } = render(<MemoryRouter><Login /></MemoryRouter>);
        expect(container.querySelector('.animate-spin')).toBeTruthy();
    });

    it('shows loading spinner when loading is true (navbar variant)', () => {
        (useAuth as any).mockReturnValue({ ...baseAuth, loading: true });
        const { container } = render(<MemoryRouter><Login variant="navbar" /></MemoryRouter>);
        expect(container.querySelector('.animate-spin')).toBeTruthy();
    });

    it('renders Sign In link in navbar variant when user is not logged in', () => {
        render(<MemoryRouter><Login variant="navbar" /></MemoryRouter>);
        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('renders user dropdown button in navbar variant when user is logged in', () => {
        (useAuth as any).mockReturnValue({
            ...baseAuth,
            user: { displayName: 'Priya Sharma', email: 'priya@example.com' },
        });
        render(<MemoryRouter><Login variant="navbar" /></MemoryRouter>);
        expect(screen.getByText('Priya')).toBeInTheDocument();
    });

    it('uses email prefix when displayName is null in navbar variant', () => {
        (useAuth as any).mockReturnValue({
            ...baseAuth,
            user: { displayName: null, email: 'priya@example.com' },
        });
        render(<MemoryRouter><Login variant="navbar" /></MemoryRouter>);
        expect(screen.getByText('priya')).toBeInTheDocument();
    });

    it('opens dropdown menu in navbar variant on button click', () => {
        (useAuth as any).mockReturnValue({
            ...baseAuth,
            user: { displayName: 'Priya', email: 'p@e.com' },
        });
        render(<MemoryRouter><Login variant="navbar" /></MemoryRouter>);
        fireEvent.click(screen.getByText('Priya'));
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('navigates to /profile from navbar dropdown', () => {
        (useAuth as any).mockReturnValue({
            ...baseAuth,
            user: { displayName: 'Priya', email: 'p@e.com' },
        });
        render(<MemoryRouter><Login variant="navbar" /></MemoryRouter>);
        fireEvent.click(screen.getByText('Priya'));
        fireEvent.click(screen.getByText('Profile'));
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('navigates to /settings from navbar dropdown', () => {
        (useAuth as any).mockReturnValue({
            ...baseAuth,
            user: { displayName: 'Priya', email: 'p@e.com' },
        });
        render(<MemoryRouter><Login variant="navbar" /></MemoryRouter>);
        fireEvent.click(screen.getByText('Priya'));
        fireEvent.click(screen.getByText('Settings'));
        expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    it('calls logout from navbar dropdown', () => {
        (useAuth as any).mockReturnValue({
            ...baseAuth,
            user: { displayName: 'Priya', email: 'p@e.com' },
        });
        render(<MemoryRouter><Login variant="navbar" /></MemoryRouter>);
        fireEvent.click(screen.getByText('Priya'));
        fireEvent.click(screen.getByText('Sign Out'));
        expect(mockLogout).toHaveBeenCalled();
    });

    it('closes navbar dropdown on outside click', () => {
        (useAuth as any).mockReturnValue({
            ...baseAuth,
            user: { displayName: 'Priya', email: 'p@e.com' },
        });
        render(<MemoryRouter><Login variant="navbar" /></MemoryRouter>);
        fireEvent.click(screen.getByText('Priya'));
        expect(screen.getByText('Profile')).toBeInTheDocument();
        fireEvent.mouseDown(document.body);
        expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });

    it('submits email login form and calls loginWithEmail', async () => {
        mockLoginWithEmail.mockResolvedValue(undefined);
        render(<MemoryRouter><Login /></MemoryRouter>);
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
            target: { name: 'email', value: 'test@test.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/), {
            target: { name: 'password', value: 'password123' },
        });
        fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!);
        await waitFor(() => {
            expect(mockLoginWithEmail).toHaveBeenCalledWith('test@test.com', 'password123');
        });
    });

    it('calls clearError when input changes while error is shown', () => {
        (useAuth as any).mockReturnValue({ ...baseAuth, error: 'Invalid credentials' });
        render(<MemoryRouter><Login /></MemoryRouter>);
        const emailInput = screen.getByPlaceholderText(/you@example.com/i);
        fireEvent.change(emailInput, { target: { name: 'email', value: 'a@b.com' } });
        expect(mockClearError).toHaveBeenCalled();
    });

    it('shows error in card variant', () => {
        (useAuth as any).mockReturnValue({ ...baseAuth, error: 'Wrong password' });
        render(<MemoryRouter><Login /></MemoryRouter>);
        expect(screen.getByText('Wrong password')).toBeInTheDocument();
    });

    it('renders role-specific copy for seeker role', () => {
        render(<MemoryRouter><Login role="seeker" /></MemoryRouter>);
        expect(screen.getByText('Welcome back')).toBeInTheDocument();
        expect(screen.getByText('Sign in to find your next opportunity')).toBeInTheDocument();
    });

    it('renders role-specific copy for employer role', () => {
        render(<MemoryRouter><Login role="employer" /></MemoryRouter>);
        expect(screen.getByText('Sign in to find top talent')).toBeInTheDocument();
    });

    it('renders Back link when role is provided', () => {
        render(<MemoryRouter><Login role="seeker" /></MemoryRouter>);
        expect(screen.getByText(/← Back/)).toBeInTheDocument();
    });

    it('shows "Back to Sign In" button in forgot mode success state', async () => {
        mockResetPassword.mockResolvedValue(undefined);
        render(<MemoryRouter><Login /></MemoryRouter>);
        fireEvent.click(screen.getByText(/Forgot password\?/i));
        fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
            target: { value: 'x@x.com' },
        });
        fireEvent.click(screen.getByText(/Send Reset Link/i));
        await waitFor(() => {
            expect(screen.getByText(/Back to Sign In/i)).toBeInTheDocument();
        });
        fireEvent.click(screen.getByText(/Back to Sign In/i));
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('shows error in forgot password mode when error is set', () => {
        (useAuth as any).mockReturnValue({ ...baseAuth, error: 'Email not found' });
        render(<MemoryRouter><Login /></MemoryRouter>);
        fireEvent.click(screen.getByText(/Forgot password\?/i));
        expect(screen.getByText('Email not found')).toBeInTheDocument();
    });

    it('calls clearError when canceling forgot mode with Back to Sign In button', () => {
        render(<MemoryRouter><Login /></MemoryRouter>);
        fireEvent.click(screen.getByText(/Forgot password\?/i));
        fireEvent.click(screen.getByText(/Back to Sign In/i));
        expect(mockClearError).toHaveBeenCalled();
    });
});
