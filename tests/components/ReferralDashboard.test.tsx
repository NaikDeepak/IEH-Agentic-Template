import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReferralDashboard } from '../../src/features/growth/components/ReferralDashboard';
import { useAuth } from '../../src/hooks/useAuth';
import { ReferralService } from '../../src/features/growth/services/referralService';
import { LedgerService } from '../../src/features/growth/services/ledgerService';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { vi, describe, it, expect, beforeEach } from 'vitest';
// import React from 'react'; // React is auto-imported in newer versions or unused here if we only use JSX

// Mock sub-components
vi.mock('../../src/features/growth/components/Verification/PhoneVerification', () => ({
    PhoneVerification: () => <div data-testid="phone-verification" />
}));
vi.mock('../../src/features/growth/components/Verification/LinkedInVerification', () => ({
    LinkedInVerification: () => <div data-testid="linkedin-verification" />
}));
vi.mock('../../src/features/growth/components/PointsBadge', () => ({
    PointsBadge: () => <div data-testid="points-badge" />
}));

// Mock useAuth
vi.mock('../../src/hooks/useAuth', () => ({
    useAuth: vi.fn()
}));

// Mock Services
vi.mock('../../src/features/growth/services/referralService', () => ({
    ReferralService: {
        ensureReferralCode: vi.fn()
    }
}));
vi.mock('../../src/features/growth/services/ledgerService', () => ({
    LedgerService: {
        adjustPoints: vi.fn()
    }
}));

// Mock Firestore
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
    getFirestore: vi.fn(() => ({})),
    db: {}
}));

// Mock Firebase lib
vi.mock('../../src/lib/firebase', () => ({
    db: {}
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Gift: () => <div />,
    Copy: () => <div />,
    CheckCircle2: () => <div />,
    Clock: () => <div />,
    AlertCircle: () => <div />,
    Trophy: () => <div />,
    Share2: () => <div />,
    Users: () => <div />,
    Zap: () => <div />,
    MessageCircle: () => <div />
}));

describe('ReferralDashboard', () => {
    const mockUser = {
        uid: 'user123',
        referralCode: 'REF123',
        browniePoints: 150
    };
    const mockRefresh = vi.fn();
    const mockGetIdToken = vi.fn().mockResolvedValue('mock-token');

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock global fetch
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ referrals: [] }),
            })
        ) as any;

        (useAuth as any).mockReturnValue({
            userData: mockUser,
            refreshUserData: mockRefresh,
            user: {
                uid: 'user123',
                getIdToken: mockGetIdToken
            }
        });
    });

    it('should render dashboard with stats', async () => {
        render(<ReferralDashboard />);
        expect(screen.getByText(/Referral Hub/i)).toBeInTheDocument();
        expect(screen.getByTestId('points-badge')).toBeInTheDocument();
        expect(screen.getByText(/REF123/)).toBeInTheDocument();
    });

    it('should call ensureReferralCode if missing', async () => {
        (useAuth as any).mockReturnValue({
            userData: { uid: 'user123', referralCode: null },
            refreshUserData: mockRefresh,
            user: {
                uid: 'user123',
                getIdToken: mockGetIdToken
            }
        });

        render(<ReferralDashboard />);

        await waitFor(() => {
            expect(ReferralService.ensureReferralCode).toHaveBeenCalledWith('user123');
        });
    });

    it('should handle point redemption', async () => {
        render(<ReferralDashboard />);

        const redeemBtn = screen.getByRole('button', { name: /Redeem Now/i });
        fireEvent.click(redeemBtn);

        await waitFor(() => {
            expect(LedgerService.adjustPoints).toHaveBeenCalledWith(
                'user123',
                -100,
                'redemption',
                expect.any(Object)
            );
        });
    });

    it('should show empty state for referral history', async () => {
        render(<ReferralDashboard />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/growth/referrals', expect.any(Object));
        });

        expect(await screen.findByText(/No referrals yet/i)).toBeInTheDocument();
    });
});
