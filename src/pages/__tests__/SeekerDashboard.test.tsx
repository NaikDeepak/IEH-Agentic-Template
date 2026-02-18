import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SeekerDashboard } from '../seeker/Dashboard';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Mocks
vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../features/seeker/services/resumeService', () => ({
    getLatestResume: vi.fn().mockResolvedValue(null)
}));

vi.mock('../../features/seeker/services/profileService', () => ({
    ProfileService: {
        getProfile: vi.fn().mockResolvedValue(null),
        syncFromResume: vi.fn()
    }
}));

vi.mock('../../features/seeker/services/skillService', () => ({
    getLatestSkillGap: vi.fn().mockResolvedValue(null)
}));

vi.mock('../../features/seeker/services/trackerService', () => ({
    TrackerService: {
        getSeekerApplications: vi.fn().mockResolvedValue([])
    }
}));

// Mock child components
vi.mock('../../features/seeker/components/Shortlist/ShortlistFeed', () => ({
    ShortlistFeed: () => <div data-testid="shortlist-feed" />
}));
vi.mock('../../features/seeker/components/Market/MarketTrends', () => ({
    MarketTrends: () => <div data-testid="market-trends" />
}));

describe('Seeker Dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useAuth).mockReturnValue({
            user: { uid: 'seeker123', displayName: 'John Doe', email: 'seeker@test.com', emailVerified: true, isAnonymous: false, metadata: {}, providerData: [], refreshToken: '', tenantId: null, delete: vi.fn(), getIdToken: vi.fn(), getIdTokenResult: vi.fn(), reload: vi.fn(), toJSON: vi.fn(), phoneNumber: null, photoURL: null, providerId: 'firebase' },
            userData: null,
            loading: false,
            error: null,
            loginWithGoogle: vi.fn(),
            loginWithEmail: vi.fn(),
            signupWithEmail: vi.fn(),
            logout: vi.fn(),
            refreshUserData: vi.fn(),
            clearError: vi.fn()
        });
    });

    it('should render the core dashboard elements after loading', async () => {
        render(
            <MemoryRouter>
                <SeekerDashboard />
            </MemoryRouter>
        );

        // Check for loader
        expect(screen.getByText(/Initializing Command Center/i)).toBeInTheDocument();

        // Wait for data load
        await waitFor(() => {
            expect(screen.getByText(/Command Center/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Welcome back, John/i)).toBeInTheDocument();
        expect(screen.getByText(/Professional Identity/i)).toBeInTheDocument();
        expect(screen.getByText(/Referral Hub/i)).toBeInTheDocument();
    });
});
