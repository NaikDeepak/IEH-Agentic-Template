import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SeekerDashboard } from '../Dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { TrackerService } from '../../../features/seeker/services/trackerService';
import { ProfileService } from '../../../features/seeker/services/profileService';
import { getLatestResume } from '../../../features/seeker/services/resumeService';
import { getLatestSkillGap } from '../../../features/seeker/services/skillService';
import React from 'react';

// Mock all internal services
vi.mock('../../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

vi.mock('../../../features/seeker/services/trackerService', () => ({
    TrackerService: {
        getSeekerApplications: vi.fn(),
    },
}));

vi.mock('../../../features/seeker/services/profileService', () => ({
    ProfileService: {
        getProfile: vi.fn(),
        syncFromResume: vi.fn(),
    },
}));

vi.mock('../../../features/seeker/services/resumeService', () => ({
    getLatestResume: vi.fn(),
    analyzeResume: vi.fn(),
}));

vi.mock('../../../features/seeker/services/skillService', () => ({
    getLatestSkillGap: vi.fn(),
}));

// Mock sub-components to focus on logic
vi.mock('../../../components/Header', () => ({
    Header: () => <div data-testid="header-mock" />,
}));

vi.mock('../../../features/seeker/components/Shortlist/ShortlistFeed', () => ({
    ShortlistFeed: () => <div data-testid="shortlist-mock" />,
}));

vi.mock('../../../features/seeker/components/Market/MarketTrends', () => ({
    MarketTrends: () => <div data-testid="market-mock" />,
}));

describe('SeekerDashboard', () => {
    const mockUser = { uid: 'user-123', displayName: 'John Doe' };
    const mockNavigate = vi.fn();

    const mockProfile = {
        uid: 'user-123',
        bio: 'Professional seeker',
        skills: ['React', 'Node'],
        preferences: { roles: ['Frontend Engineer'] },
        verified_skills: ['React'],
    };

    const mockResume = {
        score: 85,
        parsed_data: { experience: [{ role: 'Developer' }] },
        keywords: { found: ['React'] },
    };

    const mockApps = [
        { id: 'app-1', status: 'interview' },
        { id: 'app-2', status: 'applied' },
        { id: 'app-3', status: 'rejected' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        
        vi.mocked(getLatestResume).mockResolvedValue(mockResume as any);
        vi.mocked(ProfileService.getProfile).mockResolvedValue(mockProfile as any);
        vi.mocked(getLatestSkillGap).mockResolvedValue(null as any);
        vi.mocked(TrackerService.getSeekerApplications).mockResolvedValue(mockApps as any);
    });

    it('renders skeleton loading state', async () => {
        // Return a promise that doesn't resolve immediately
        vi.mocked(getLatestResume).mockReturnValue(new Promise(() => {}));
        
        render(<SeekerDashboard />);
        expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
    });

    it('renders dashboard data after loading', async () => {
        render(<SeekerDashboard />);
        
        await waitFor(() => {
            expect(screen.getByText(/Welcome back, John/i)).toBeInTheDocument();
        });

        expect(screen.getByText('2')).toBeInTheDocument(); // Active applications
        expect(screen.getByText(/1 Interviewing/i)).toBeInTheDocument();
        expect(screen.getByText(/1 Applied/i)).toBeInTheDocument();
        expect(screen.getByText('Frontend Engineer')).toBeInTheDocument(); // Target role
    });

    it('syncs profile from resume if profile missing', async () => {
        vi.mocked(ProfileService.getProfile)
            .mockResolvedValueOnce(null as any) // first call returns null
            .mockResolvedValueOnce(mockProfile as any); // second call (after sync) returns profile

        render(<SeekerDashboard />);
        
        await waitFor(() => {
            expect(ProfileService.syncFromResume).toHaveBeenCalledWith(mockUser.uid, mockResume);
        });
    });

    it('navigates to various pages when tool links clicked', async () => {
        render(<SeekerDashboard />);
        
        await waitFor(() => screen.getByText(/Welcome back/i));

        fireEvent.click(screen.getByText('Referral Hub'));
        expect(mockNavigate).toHaveBeenCalledWith('/seeker/referral');

        fireEvent.click(screen.getByText('Interview Prep'));
        expect(mockNavigate).toHaveBeenCalledWith('/seeker/interview');

        fireEvent.click(screen.getByText('App Tracker'));
        expect(mockNavigate).toHaveBeenCalledWith('/seeker/tracker');

        fireEvent.click(screen.getByText('Saved Jobs'));
        expect(mockNavigate).toHaveBeenCalledWith('/seeker/saved');

        fireEvent.click(screen.getByText('Job Alerts'));
        expect(mockNavigate).toHaveBeenCalledWith('/seeker/alerts');
    });

    it('navigates to profile edit and resume improvement', async () => {
        render(<SeekerDashboard />);
        
        await waitFor(() => screen.getByText(/Welcome back/i));

        fireEvent.click(screen.getByText(/Edit Profile/i));
        expect(mockNavigate).toHaveBeenCalledWith('/seeker/profile');

        fireEvent.click(screen.getByText(/Improve Resume/i));
        expect(mockNavigate).toHaveBeenCalledWith('/seeker/resume');
        
        fireEvent.click(screen.getByText(/Open Gap Analysis/i));
        expect(mockNavigate).toHaveBeenCalledWith('/seeker/skills');
    });

    it('handles empty state for resume and skills', async () => {
        vi.mocked(getLatestResume).mockResolvedValue(null as any);
        vi.mocked(ProfileService.getProfile).mockResolvedValue({
            ...mockProfile,
            skills: [],
            bio: '',
        } as any);

        render(<SeekerDashboard />);
        
        await waitFor(() => {
            expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
        });

        // Debug output to see why it's failing
        // console.log("DOM during empty state:", screen.debug());

        expect(screen.getByText(/Professional Identity/i)).toBeInTheDocument();
        expect(screen.getByText(/No Resume Analyzed/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Upload Now/i));
        expect(mockNavigate).toHaveBeenCalledWith('/seeker/resume');
    });

    it('handles dashboard data fetch error', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.mocked(getLatestResume).mockRejectedValue(new Error('Fetch failed'));

        render(<SeekerDashboard />);
        
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Dashboard data fetch error:", expect.any(Error));
        });
        consoleSpy.mockRestore();
    });
});
