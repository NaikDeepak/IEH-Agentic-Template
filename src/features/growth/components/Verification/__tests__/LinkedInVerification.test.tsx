import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LinkedInVerification } from '../LinkedInVerification';

const mockGetIdToken = vi.fn().mockResolvedValue('mock-token');
const mockRefreshUserData = vi.fn();

vi.mock('../../../../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

import { useAuth } from '../../../../../hooks/useAuth';

const baseAuthContext = {
    user: { getIdToken: mockGetIdToken },
    userData: { linkedinVerified: false },
    refreshUserData: mockRefreshUserData,
};

describe('LinkedInVerification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue(baseAuthContext);
    });

    it('renders the form when not verified', () => {
        render(<LinkedInVerification />);
        expect(screen.getByText('LinkedIn Verification')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /verify with linkedin/i })).toBeInTheDocument();
    });

    it('renders verified state when linkedinVerified is true', () => {
        (useAuth as any).mockReturnValue({
            ...baseAuthContext,
            userData: { linkedinVerified: true },
        });
        render(<LinkedInVerification />);
        expect(screen.getByText('LinkedIn Verified')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /verify/i })).not.toBeInTheDocument();
    });

    it('shows error for invalid URL format', async () => {
        render(<LinkedInVerification />);
        const input = screen.getByPlaceholderText(/https:\/\/linkedin\.com/i);
        fireEvent.change(input, { target: { value: 'not-a-url' } });
        fireEvent.submit(screen.getByRole('button', { name: /verify/i }).closest('form')!);
        await waitFor(() => {
            expect(screen.getByText(/valid LinkedIn profile URL/i)).toBeInTheDocument();
        });
    });

    it('shows error for non-LinkedIn URL', async () => {
        render(<LinkedInVerification />);
        const input = screen.getByPlaceholderText(/https:\/\/linkedin\.com/i);
        fireEvent.change(input, { target: { value: 'https://github.com/user' } });
        fireEvent.submit(screen.getByRole('button', { name: /verify/i }).closest('form')!);
        await waitFor(() => {
            expect(screen.getByText(/valid LinkedIn profile URL/i)).toBeInTheDocument();
        });
    });

    it('shows error for LinkedIn URL with http (not https)', async () => {
        render(<LinkedInVerification />);
        const input = screen.getByPlaceholderText(/https:\/\/linkedin\.com/i);
        fireEvent.change(input, { target: { value: 'http://linkedin.com/in/username' } });
        fireEvent.submit(screen.getByRole('button', { name: /verify/i }).closest('form')!);
        await waitFor(() => {
            expect(screen.getByText(/valid LinkedIn profile URL/i)).toBeInTheDocument();
        });
    });

    it('shows error for LinkedIn URL without /in/ path', async () => {
        render(<LinkedInVerification />);
        const input = screen.getByPlaceholderText(/https:\/\/linkedin\.com/i);
        fireEvent.change(input, { target: { value: 'https://linkedin.com/company/acme' } });
        fireEvent.submit(screen.getByRole('button', { name: /verify/i }).closest('form')!);
        await waitFor(() => {
            expect(screen.getByText(/valid LinkedIn profile URL/i)).toBeInTheDocument();
        });
    });

    it('submits successfully with a valid LinkedIn URL', async () => {
        (global.fetch as any) = vi.fn().mockResolvedValue({ ok: true });

        render(<LinkedInVerification />);
        const input = screen.getByPlaceholderText(/https:\/\/linkedin\.com/i);
        fireEvent.change(input, { target: { value: 'https://linkedin.com/in/testuser' } });
        fireEvent.submit(screen.getByRole('button', { name: /verify/i }).closest('form')!);

        // Component has a 2s simulated delay — wait up to 4s
        await waitFor(() => {
            expect(mockRefreshUserData).toHaveBeenCalled();
        }, { timeout: 4000 });
    }, 8000);

    it('shows error when server returns non-ok response', async () => {
        (global.fetch as any) = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Server error' }),
        });

        render(<LinkedInVerification />);
        const input = screen.getByPlaceholderText(/https:\/\/linkedin\.com/i);
        fireEvent.change(input, { target: { value: 'https://linkedin.com/in/testuser' } });
        fireEvent.submit(screen.getByRole('button', { name: /verify/i }).closest('form')!);

        await waitFor(() => {
            expect(screen.getByText('Server error')).toBeInTheDocument();
        }, { timeout: 4000 });
    }, 8000);

    it('does not submit when user is null', async () => {
        (useAuth as any).mockReturnValue({ ...baseAuthContext, user: null });
        render(<LinkedInVerification />);
        const input = screen.getByPlaceholderText(/https:\/\/linkedin\.com/i);
        fireEvent.change(input, { target: { value: 'https://linkedin.com/in/testuser' } });
        fireEvent.submit(screen.getByRole('button', { name: /verify/i }).closest('form')!);
        expect(mockGetIdToken).not.toHaveBeenCalled();
    });
});
