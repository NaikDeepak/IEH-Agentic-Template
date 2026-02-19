import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SeekerDashboard } from '../../../src/pages/seeker/Dashboard';
import { useAuth } from '../../../src/hooks/useAuth';
import { getLatestResume } from '../../../src/features/seeker/services/resumeService';
import { getLatestSkillGap } from '../../../src/features/seeker/services/skillService';
import { ProfileService } from '../../../src/features/seeker/services/profileService';
import { TrackerService } from '../../../src/features/seeker/services/trackerService';
import { MemoryRouter } from 'react-router-dom';

// Mock Dependencies
vi.mock('../../../src/hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../../src/features/seeker/services/resumeService', () => ({
    getLatestResume: vi.fn()
}));

vi.mock('../../../src/features/seeker/services/skillService', () => ({
    getLatestSkillGap: vi.fn()
}));

vi.mock('../../../src/features/seeker/services/profileService', () => ({
    ProfileService: {
        getProfile: vi.fn(),
        syncFromResume: vi.fn()
    }
}));

vi.mock('../../../src/features/seeker/services/trackerService', () => ({
    TrackerService: {
        getSeekerApplications: vi.fn()
    }
}));

// Mock sub-components to focus on Dashboard logic
vi.mock('../../../src/features/seeker/components/Shortlist/ShortlistFeed', () => ({
    ShortlistFeed: () => <div data-testid="shortlist-feed">Shortlist</div>
}));

vi.mock('../../../src/features/seeker/components/Market/MarketTrends', () => ({
    MarketTrends: () => <div data-testid="market-trends">Trends</div>
}));

vi.mock('../../../src/components/Header', () => ({
    Header: () => <div data-testid="header">Header</div>
}));

describe('SeekerDashboard', () => {
    const mockUser = { uid: 'u1', displayName: 'John Doe' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser });
        (getLatestResume as any).mockResolvedValue({
            score: 0,
            parsed_data: { experience: [] },
            keywords: { found: [] }
        });
        (ProfileService.getProfile as any).mockResolvedValue(null);
        (getLatestSkillGap as any).mockResolvedValue(null);
        (TrackerService.getSeekerApplications as any).mockResolvedValue([]);
    });

    it('renders loading state initially', () => {
        render(
            <MemoryRouter>
                <SeekerDashboard />
            </MemoryRouter>
        );
        expect(screen.getByText(/Initializing Command Center/i)).toBeDefined();
    });

    it('fetches and displays dashboard data', async () => {
        (getLatestResume as any).mockResolvedValueOnce({
            score: 85,
            parsed_data: { experience: [{ role: 'Senior Dev' }] },
            keywords: { found: ['React', 'TypeScript'] }
        });
        (TrackerService.getSeekerApplications as any).mockResolvedValueOnce([
            { id: 'app1', status: 'interview' }
        ]);

        render(
            <MemoryRouter>
                <SeekerDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Command Center')).toBeInTheDocument();
            expect(screen.getByLabelText(/1 active applications/i)).toBeInTheDocument();
            expect(screen.getByText('Senior Dev')).toBeInTheDocument();
        }, { timeout: 4000 });
    });

    it('syncs profile from resume if profile is missing', async () => {
        const mockResume = {
            id: 'res1',
            parsed_data: { experience: [{ role: 'Dev' }] },
            keywords: { found: [] }
        };
        (getLatestResume as any).mockResolvedValueOnce(mockResume);
        (ProfileService.getProfile as any)
            .mockResolvedValueOnce(null) // First call: empty
            .mockResolvedValueOnce({ preferences: { roles: ['Dev'] }, skills: [], bio: '', verified_skills: [] }); // After sync

        render(
            <MemoryRouter>
                <SeekerDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(ProfileService.syncFromResume).toHaveBeenCalledWith('u1', mockResume);
            expect(screen.getByText('Dev')).toBeInTheDocument();
        });
    });
});
