import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from '../SettingsPage';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

describe('SettingsPage', () => {
    const updateDisplayNameMock = vi.fn();
    const deleteAccountMock = vi.fn();
    const resetPasswordMock = vi.fn();
    const logoutMock = vi.fn();
    const clearErrorMock = vi.fn();

    const baseAuth = {
        user: { displayName: 'Test User', email: 'test@example.com', uid: 'uid-1' },
        userData: { role: 'seeker' },
        updateDisplayName: updateDisplayNameMock,
        deleteAccount: deleteAccountMock,
        resetPassword: resetPasswordMock,
        logout: logoutMock,
        clearError: clearErrorMock,
        error: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as Mock).mockReturnValue(baseAuth);
    });

    const renderPage = () =>
        render(<MemoryRouter><SettingsPage /></MemoryRouter>);

    // --- Rendering ---

    it('renders account info from auth context', () => {
        renderPage();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
        expect(screen.getByText('Job Seeker')).toBeInTheDocument();
    });

    it('shows employer role label for employer users', () => {
        (useAuth as Mock).mockReturnValue({ ...baseAuth, userData: { role: 'employer' } });
        renderPage();
        expect(screen.getByText('Employer')).toBeInTheDocument();
    });

    // --- Display Name Edit ---

    it('shows edit input when Edit button is clicked', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    it('calls updateDisplayName with trimmed value on save', async () => {
        updateDisplayNameMock.mockResolvedValue(undefined);
        renderPage();

        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
        const input = screen.getByDisplayValue('Test User');
        fireEvent.change(input, { target: { value: '  New Name  ' } });
        // Use Enter key as the cleaner path
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(updateDisplayNameMock).toHaveBeenCalledWith('New Name');
        });
    });

    it('cancels edit on Escape key', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
        const input = screen.getByDisplayValue('Test User');
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(screen.queryByDisplayValue('Test User')).not.toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('shows error when updateDisplayName fails', async () => {
        updateDisplayNameMock.mockRejectedValue(new Error('network error'));
        renderPage();

        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
        const input = screen.getByDisplayValue('Test User');
        fireEvent.change(input, { target: { value: 'Another Name' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(screen.getByText(/failed to update name/i)).toBeInTheDocument();
        });
    });

    // --- Password Reset ---

    it('shows sent confirmation after password reset', async () => {
        resetPasswordMock.mockResolvedValue(undefined);
        renderPage();

        fireEvent.click(screen.getByRole('button', { name: /send password reset email/i }));

        await waitFor(() => {
            expect(screen.getByText(/reset link sent/i)).toBeInTheDocument();
        });
        expect(resetPasswordMock).toHaveBeenCalledWith('test@example.com');
    });

    it('shows error when password reset fails', async () => {
        resetPasswordMock.mockRejectedValue(new Error('send failed'));
        renderPage();

        fireEvent.click(screen.getByRole('button', { name: /send password reset email/i }));

        await waitFor(() => {
            expect(screen.getByText(/failed to send reset email/i)).toBeInTheDocument();
        });
    });

    // --- Delete Account ---

    it('shows confirmation panel when Delete is clicked', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
        expect(screen.getByRole('button', { name: /yes, delete my account/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('cancels delete and returns to idle', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(screen.queryByRole('button', { name: /yes, delete my account/i })).not.toBeInTheDocument();
    });

    it('calls deleteAccount and navigates to / on success', async () => {
        deleteAccountMock.mockResolvedValue(undefined);
        logoutMock.mockResolvedValue(undefined);
        renderPage();

        fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
        fireEvent.click(screen.getByRole('button', { name: /yes, delete my account/i }));

        await waitFor(() => {
            expect(deleteAccountMock).toHaveBeenCalled();
            expect(logoutMock).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('shows friendly error when deleteAccount fails with requires-recent-login', async () => {
        const friendlyMessage = 'For security, please sign out and sign back in before deleting your account.';
        deleteAccountMock.mockRejectedValue(new Error('auth/requires-recent-login'));
        (useAuth as Mock).mockReturnValue({ ...baseAuth, error: friendlyMessage, deleteAccount: deleteAccountMock });
        renderPage();

        fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
        fireEvent.click(screen.getByRole('button', { name: /yes, delete my account/i }));

        await waitFor(() => {
            expect(screen.getByText(friendlyMessage)).toBeInTheDocument();
        });
    });
});
