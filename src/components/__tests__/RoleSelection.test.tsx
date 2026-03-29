import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoleSelection } from '../RoleSelection';
import { useAuth } from '../../hooks/useAuth';
import { callAIProxy } from '../../lib/ai/proxy';
import React from 'react';

vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../lib/ai/proxy', () => ({
    callAIProxy: vi.fn(),
}));

describe('RoleSelection', () => {
    const mockUser = {
        uid: 'user-1',
        getIdToken: vi.fn().mockResolvedValue('token'),
    };
    const mockRefreshUserData = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when userData is null', () => {
        (useAuth as any).mockReturnValue({ userData: null, user: mockUser, refreshUserData: mockRefreshUserData });
        const { container } = render(<RoleSelection />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when userData already has a role', () => {
        (useAuth as any).mockReturnValue({
            userData: { role: 'seeker' },
            user: mockUser,
            refreshUserData: mockRefreshUserData,
        });
        const { container } = render(<RoleSelection />);
        expect(container.firstChild).toBeNull();
    });

    it('renders role selection modal when userData has no role', () => {
        (useAuth as any).mockReturnValue({
            userData: { role: null },
            user: mockUser,
            refreshUserData: mockRefreshUserData,
        });
        render(<RoleSelection />);
        expect(screen.getByText("How will you use WorkMila?")).toBeInTheDocument();
        expect(screen.getByText("I'm a Candidate")).toBeInTheDocument();
        expect(screen.getByText("I'm Hiring")).toBeInTheDocument();
    });

    it('calls onboard API and refreshes user data when seeker is selected', async () => {
        (useAuth as any).mockReturnValue({
            userData: { role: null },
            user: mockUser,
            refreshUserData: mockRefreshUserData,
        });
        (callAIProxy as any).mockResolvedValue({});

        render(<RoleSelection />);
        fireEvent.click(screen.getByText("I'm a Candidate"));

        await waitFor(() => {
            expect(callAIProxy).toHaveBeenCalledWith('/api/user/onboard', { role: 'seeker' });
            expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
            expect(mockRefreshUserData).toHaveBeenCalled();
        });
    });

    it('calls onboard API when employer is selected', async () => {
        (useAuth as any).mockReturnValue({
            userData: { role: null },
            user: mockUser,
            refreshUserData: mockRefreshUserData,
        });
        (callAIProxy as any).mockResolvedValue({});

        render(<RoleSelection />);
        fireEvent.click(screen.getByText("I'm Hiring"));

        await waitFor(() => {
            expect(callAIProxy).toHaveBeenCalledWith('/api/user/onboard', { role: 'employer' });
        });
    });

    it('resets state on API error', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (useAuth as any).mockReturnValue({
            userData: { role: null },
            user: mockUser,
            refreshUserData: mockRefreshUserData,
        });
        (callAIProxy as any).mockRejectedValue(new Error('API error'));

        render(<RoleSelection />);
        fireEvent.click(screen.getByText("I'm a Candidate"));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalled();
        });
        consoleSpy.mockRestore();
    });
});
