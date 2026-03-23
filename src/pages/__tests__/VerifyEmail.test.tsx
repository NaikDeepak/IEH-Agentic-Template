import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { VerifyEmail } from '../VerifyEmail';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@sentry/react', () => ({ captureException: vi.fn() }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

describe('VerifyEmail', () => {
    const sendVerificationEmailMock = vi.fn();
    const logoutMock = vi.fn();
    const clearErrorMock = vi.fn();

    const defaultAuth = {
        user: { email: 'test@example.com', reload: vi.fn() },
        sendVerificationEmail: sendVerificationEmailMock,
        logout: logoutMock,
        error: null,
        clearError: clearErrorMock,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as Mock).mockReturnValue(defaultAuth);
    });

    const renderPage = () =>
        render(<MemoryRouter><VerifyEmail /></MemoryRouter>);

    it('renders the page with the user email', () => {
        renderPage();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
    });

    it('calls sendVerificationEmail and shows success on resend', async () => {
        sendVerificationEmailMock.mockResolvedValue(undefined);
        renderPage();

        fireEvent.click(screen.getByText(/resend verification email/i));

        await waitFor(() => {
            expect(sendVerificationEmailMock).toHaveBeenCalled();
            expect(screen.getByText(/resent successfully/i)).toBeInTheDocument();
        });
    });

    it('calls user.reload and navigates to /dashboard on verification check', async () => {
        const reloadMock = vi.fn().mockResolvedValue(undefined);
        (useAuth as Mock).mockReturnValue({ ...defaultAuth, user: { email: 'test@example.com', reload: reloadMock } });
        renderPage();

        fireEvent.click(screen.getByText(/i've verified my email/i));

        await waitFor(() => {
            expect(reloadMock).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('calls logout when sign out link is clicked', async () => {
        logoutMock.mockResolvedValue(undefined);
        renderPage();

        fireEvent.click(screen.getByText(/sign out and use a different account/i));

        await waitFor(() => { expect(logoutMock).toHaveBeenCalled(); });
    });

    it('displays error from useAuth hook', () => {
        (useAuth as Mock).mockReturnValue({ ...defaultAuth, error: 'Too many requests. Please wait a few minutes before trying again.' });
        renderPage();
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });

    it('catches and logs error on resend failure', async () => {
        const error = new Error('resend failed');
        sendVerificationEmailMock.mockRejectedValue(error);
        renderPage();

        fireEvent.click(screen.getByText(/resend verification email/i));

        await waitFor(() => {
            expect(sendVerificationEmailMock).toHaveBeenCalled();
            expect(Sentry.captureException).toHaveBeenCalledWith(error);
        });
    });

    it('catches and logs error on check verified failure', async () => {
        const error = new Error('reload failed');
        const reloadMock = vi.fn().mockRejectedValue(error);
        (useAuth as Mock).mockReturnValue({ ...defaultAuth, user: { email: 'test@example.com', reload: reloadMock } });
        renderPage();

        fireEvent.click(screen.getByText(/i've verified my email/i));

        await waitFor(() => {
            expect(reloadMock).toHaveBeenCalled();
            expect(Sentry.captureException).toHaveBeenCalledWith(error);
        });
    });

    it('catches and logs error on logout failure', async () => {
        const error = new Error('logout failed');
        logoutMock.mockRejectedValue(error);
        renderPage();

        fireEvent.click(screen.getByText(/sign out and use a different account/i));

        await waitFor(() => {
            expect(logoutMock).toHaveBeenCalled();
            expect(Sentry.captureException).toHaveBeenCalledWith(error);
        });
    });
});
