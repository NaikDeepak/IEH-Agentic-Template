import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../Login';
import { MemoryRouter } from 'react-router-dom';

const mockResetPassword = vi.fn();
const mockClearError = vi.fn();

// Mock Auth
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        loginWithGoogle: vi.fn(),
        loginWithEmail: vi.fn(),
        resetPassword: mockResetPassword,
        user: null,
        loading: false,
        logout: vi.fn(),
        error: null,
        clearError: mockClearError
    })
}));

describe('Login', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });
    it('renders correctly with form fields', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        // Use more flexible text matchers
        expect(screen.getByText(/Email Address/i)).toBeDefined();
        expect(screen.getByLabelText(/Password/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeDefined();
    });

    it('updates input values on change', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        // Find by label text or placeholder
        const emailInput = screen.getByPlaceholderText(/you@example.com/i) as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput.value).toBe('test@example.com');
    });

    it('renders social login buttons', () => {
        vi.stubEnv('VITE_USE_FIREBASE_EMULATOR', 'false');
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    });

    it('shows "Forgot password?" link on the login card', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        expect(screen.getByText(/Forgot password\?/i)).toBeDefined();
    });

    it('switches to forgot-password view when link is clicked', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByText(/Forgot password\?/i));
        expect(screen.getByText(/Reset Password/i)).toBeDefined();
        expect(screen.getByText(/Send Reset Link/i)).toBeDefined();
    });

    it('calls resetPassword with the entered email', async () => {
        mockResetPassword.mockResolvedValueOnce(undefined);
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        // Enter forgot-password mode
        fireEvent.click(screen.getByText(/Forgot password\?/i));
        const emailInput = screen.getByPlaceholderText(/you@example.com/i) as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.click(screen.getByText(/Send Reset Link/i));
        await waitFor(() => {
            expect(mockResetPassword).toHaveBeenCalledWith('user@example.com');
        });
    });

    it('shows success state after reset link is sent', async () => {
        mockResetPassword.mockResolvedValueOnce(undefined);
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByText(/Forgot password\?/i));
        const emailInput = screen.getByPlaceholderText(/you@example.com/i) as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.click(screen.getByText(/Send Reset Link/i));
        await waitFor(() => {
            expect(screen.getByText(/Reset link sent to/i)).toBeDefined();
        });
    });
});
