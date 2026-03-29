import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from '../SettingsPage';
import { useAuth } from '../../hooks/useAuth';

const { mockRef } = vi.hoisted(() => ({
    mockRef: { current: null as any }
}));

vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn(() => mockRef.current),
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
        mockRef.current = baseAuth;
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
        mockRef.current = { ...baseAuth, userData: { role: 'employer' } };
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
        const errorMsg = 'Failed to update name';
        updateDisplayNameMock.mockImplementation(() => {
            mockRef.current = { ...baseAuth, error: errorMsg };
            return Promise.reject(new Error(errorMsg));
        });
        renderPage();

        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
        const input = screen.getByDisplayValue('Test User');
        fireEvent.change(input, { target: { value: 'Another Name' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        await waitFor(() => {
            expect(screen.getByText(errorMsg)).toBeInTheDocument();
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
        const errorMsg = 'Failed to send reset email';
        resetPasswordMock.mockImplementation(() => {
            mockRef.current = { ...baseAuth, error: errorMsg };
            return Promise.reject(new Error(errorMsg));
        });
        renderPage();

        fireEvent.click(screen.getByRole('button', { name: /send password reset email/i }));

        await waitFor(() => {
            expect(screen.getByText(errorMsg)).toBeInTheDocument();
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
        
        deleteAccountMock.mockImplementation(() => {
            mockRef.current = { 
                ...baseAuth, 
                error: friendlyMessage, 
                deleteAccount: deleteAccountMock 
            };
            return Promise.reject(new Error('auth/requires-recent-login'));
        });

        renderPage();

        fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
        fireEvent.click(screen.getByRole('button', { name: /yes, delete my account/i }));

        await waitFor(() => {
            expect(screen.getByText(friendlyMessage)).toBeInTheDocument();
        });
    });

    // --- Save button click & X cancel ---

    it('saves name via checkmark button click', async () => {
        updateDisplayNameMock.mockResolvedValue(undefined);
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
        const input = screen.getByDisplayValue('Test User');
        fireEvent.change(input, { target: { value: 'Saved Name' } });
        // Click the check/save button (aria-label not explicit; it's the button next to the input)
        const saveBtn = screen.getAllByRole('button').find(b => b.querySelector('.lucide-check') || b.className.includes('bg-sky-700'));
        if (saveBtn) fireEvent.click(saveBtn);
        await waitFor(() => {
            expect(updateDisplayNameMock).toHaveBeenCalledWith('Saved Name');
        });
    });

    it('cancels name edit via X button', () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
        // Find the cancel X button (sibling of the check button)
        const allButtons = screen.getAllByRole('button');
        const cancelXBtn = allButtons.find(b => b.className.includes('border-slate-200') && b.className.includes('text-slate-400'));
        if (cancelXBtn) fireEvent.click(cancelXBtn);
        expect(screen.queryByDisplayValue('Test User')).not.toBeInTheDocument();
    });

    it('does not save when name unchanged (closes edit silently)', async () => {
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
        // Don't change the value - press Enter
        const input = screen.getByDisplayValue('Test User');
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => {
            expect(updateDisplayNameMock).not.toHaveBeenCalled();
        });
        expect(screen.queryByDisplayValue('Test User')).not.toBeInTheDocument();
    });

    it('shows admin role label for admin users', () => {
        mockRef.current = { ...baseAuth, userData: { role: 'admin' } };
        renderPage();
        expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    // --- Email section ---

    it('opens email edit mode when Change button is clicked', () => {
        const verifyEmailUpdateMock = vi.fn();
        mockRef.current = { ...baseAuth, verifyEmailUpdate: verifyEmailUpdateMock };
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /change/i }));
        expect(screen.getByPlaceholderText(/new email address/i)).toBeInTheDocument();
    });

    it('cancels email edit on Escape key', () => {
        const verifyEmailUpdateMock = vi.fn();
        mockRef.current = { ...baseAuth, verifyEmailUpdate: verifyEmailUpdateMock };
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /change/i }));
        const input = screen.getByPlaceholderText(/new email address/i);
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(screen.queryByPlaceholderText(/new email address/i)).not.toBeInTheDocument();
    });

    it('submits email update and shows confirmation', async () => {
        const verifyEmailUpdateMock = vi.fn().mockResolvedValue(undefined);
        mockRef.current = { ...baseAuth, verifyEmailUpdate: verifyEmailUpdateMock };
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: /change/i }));
        const input = screen.getByPlaceholderText(/new email address/i);
        fireEvent.change(input, { target: { value: 'new@example.com' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => {
            expect(verifyEmailUpdateMock).toHaveBeenCalledWith('new@example.com');
        });
        await waitFor(() => {
            expect(screen.getByText(/verification link sent/i)).toBeInTheDocument();
        });
    });
});
