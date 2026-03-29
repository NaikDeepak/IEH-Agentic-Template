import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SeekerDashboard } from '../Dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getLatestResume } from '../../../features/seeker/services/resumeService';
import { getLatestSkillGap } from '../../../features/seeker/services/skillService';
import { ProfileService } from '../../../features/seeker/services/profileService';
import { TrackerService } from '../../../features/seeker/services/trackerService';

// Mock UI Components to simplify testing
vi.mock('../../../components/Header', () => ({
    Header: () => <div data-testid="mock-header">Header</div>
}));

vi.mock('../../../features/seeker/components/Shortlist/ShortlistFeed', () => ({
    ShortlistFeed: () => <div data-testid="mock-shortlist">Shortlist Feed</div>
}));

vi.mock('../../../features/seeker/components/Market/MarketTrends', () => ({
    MarketTrends: () => <div data-testid="mock-market-trends">Market Trends</div>
}));

// Mock Hooks
vi.mock('../../../hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

// Mock Services
vi.mock('../../../features/seeker/services/resumeService', () => ({
    getLatestResume: vi.fn()
}));

vi.mock('../../../features/seeker/services/skillService', () => ({
    getLatestSkillGap: vi.fn()
}));

vi.mock('../../../features/seeker/services/profileService', () => ({
    ProfileService: {
        getProfile: vi.fn(),
        syncFromResume: vi.fn()
    }
}));

vi.mock('../../../features/seeker/services/trackerService', () => ({
    TrackerService: {
        getSeekerApplications: vi.fn()
    }
}));

describe('SeekerDashboard', () => {
    const mockUser = { uid: 'user123', displayName: 'John Doe' };
    const mockProfile = {
        uid: 'user123',
        bio: 'Senior Developer with 10 years experience',
        skills: ['React', 'Node.js'],
        preferences: { roles: ['Software Engineer'] },
        verified_skills: ['React']
    };
    const mockResume = {
        id: 'res123',
        score: 85,
        parsed_data: {
            experience: [{ role: 'Developer' }]
        },
        keywords: { found: ['React'] }
    };
    const mockApplications = [
        { id: 'app1', status: 'interview' },
        { id: 'app2', status: 'applied' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser });
        (ProfileService.getProfile as any).mockResolvedValue(mockProfile);
        (getLatestResume as any).mockResolvedValue(mockResume);
        (getLatestSkillGap as any).mockResolvedValue(null);
        (TrackerService.getSeekerApplications as any).mockResolvedValue(mockApplications);
    });

    it('renders loading state initially', () => {
        render(<SeekerDashboard />);
        expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
    });

    it('renders dashboard content after loading', async () => {
        render(<SeekerDashboard />);

        await waitFor(() => {
            expect(screen.queryByTestId('dashboard-skeleton')).not.toBeInTheDocument();
        });

        expect(screen.getByText(/Welcome back, John/i)).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Active applications count
        expect(screen.getByText('Software Engineer')).toBeInTheDocument(); // Target role
        expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();
        expect(screen.getByText('85')).toBeInTheDocument(); // Resume score
    });

    it('displays fallback target role if profile is missing', async () => {
        (ProfileService.getProfile as any).mockResolvedValue(null);
        (getLatestSkillGap as any).mockResolvedValue({ target_role: 'Architect' });

        render(<SeekerDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Architect')).toBeInTheDocument();
        });
    });

    it('triggers profile sync if profile is missing but resume exists', async () => {
        (ProfileService.getProfile as any).mockResolvedValueOnce(null).mockResolvedValueOnce(mockProfile);
        (getLatestResume as any).mockResolvedValue(mockResume);

        render(<SeekerDashboard />);

        await waitFor(() => {
            expect(ProfileService.syncFromResume).toHaveBeenCalledWith(mockUser.uid, mockResume);
        });
    });

    it('handles data fetch error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (getLatestResume as any).mockRejectedValue(new Error('Fetch failed'));

        render(<SeekerDashboard />);

        await waitFor(() => {
            expect(screen.queryByTestId('dashboard-skeleton')).not.toBeInTheDocument();
        });

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
