import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ReferralDashboard } from '../ReferralDashboard';
import { useAuth } from '../../../../hooks/useAuth';
import { ReferralService } from '../../services/referralService';
import { LedgerService } from '../../services/ledgerService';

// Mock dependencies
vi.mock('../../../../hooks/useAuth');
vi.mock('../../services/referralService');
vi.mock('../../services/ledgerService');

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Gift: () => <div data-testid="gift-icon" />,
    Copy: () => <div data-testid="copy-icon" />,
    CheckCircle2: () => <div data-testid="check-icon" />,
    Clock: () => <div data-testid="clock-icon" />,
    Trophy: () => <div data-testid="trophy-icon" />,
    Share2: () => <div data-testid="share-icon" />,
    Users: () => <div data-testid="users-icon" />,
    Zap: () => <div data-testid="zap-icon" />,
    MessageCircle: () => <div data-testid="message-icon" />,
}));

// Mock sub-components
vi.mock('../Verification/PhoneVerification', () => ({
    PhoneVerification: () => <div data-testid="phone-verification">Phone</div>,
}));
vi.mock('../Verification/LinkedInVerification', () => ({
    LinkedInVerification: () => <div data-testid="linkedin-verification">LinkedIn</div>,
}));
vi.mock('../PointsBadge', () => ({
    PointsBadge: () => <div data-testid="points-badge">Points</div>,
}));

describe('ReferralDashboard', () => {
    const mockUser = {
        uid: 'user123',
        getIdToken: vi.fn().mockResolvedValue('mock-token'),
    };
    const mockUserData = {
        uid: 'user123',
        referralCode: 'REF123',
        browniePoints: 150
    };
    const refreshUserData = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({
            user: mockUser,
            userData: mockUserData,
            refreshUserData
        });

        // Mock global fetch
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                referrals: [
                    { id: 'ref1', email: 'ref1@test.com', displayName: 'Ref One', status: 'verified', joinedAt: '2024-01-01' },
                    { id: 'ref2', email: 'ref2@test.com', displayName: 'Ref Two', status: 'rewarded', joinedAt: '2024-01-02' }
                ]
            })
        });

        // Mock Clipboard
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });

        // Mock window.open
        window.open = vi.fn();
    });

    const renderDashboard = () => {
        return render(
            <MemoryRouter>
                <ReferralDashboard />
            </MemoryRouter>
        );
    };

    it('renders heading and points badge', async () => {
        renderDashboard();
        expect(screen.getByText('Referral Hub')).toBeInTheDocument();
        expect(screen.getByTestId('points-badge')).toBeInTheDocument();
    });

    it('ensures referral code if missing', async () => {
        (useAuth as any).mockReturnValue({
            user: mockUser,
            userData: { uid: 'user123' }, // missing referralCode
            refreshUserData
        });

        renderDashboard();

        await waitFor(() => {
            expect(ReferralService.ensureReferralCode).toHaveBeenCalledWith('user123');
            expect(refreshUserData).toHaveBeenCalled();
        });
    });

    it('loads and displays referral history', async () => {
        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('Ref One')).toBeInTheDocument();
            expect(screen.getByText('Ref Two')).toBeInTheDocument();
            expect(screen.getByText('+50 BP')).toBeInTheDocument();
        });
    });

    it('handles copying referral link', async () => {
        renderDashboard();
        const copyBtn = screen.getByTitle('Copy link');
        fireEvent.click(copyBtn);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('REF123'));
    });

    it('handles whatsapp sharing', async () => {
        renderDashboard();
        const shareBtn = screen.getByTitle('Share via WhatsApp');
        fireEvent.click(shareBtn);

        expect(window.open).toHaveBeenCalledWith(expect.stringContaining('wa.me'), '_blank');
    });

    it('handles redeeming rewards', async () => {
        renderDashboard();
        
        const redeemBtn = screen.getAllByText('Redeem Now')[0]; // First one is AI Interview Coach
        fireEvent.click(redeemBtn);

        await waitFor(() => {
            expect(LedgerService.adjustPoints).toHaveBeenCalledWith(
                'user123',
                -100,
                'redemption',
                expect.anything()
            );
            expect(refreshUserData).toHaveBeenCalled();
        });
    });

    it('disables redeem button if points are insufficient', () => {
        (useAuth as any).mockReturnValue({
            user: mockUser,
            userData: { ...mockUserData, browniePoints: 50 },
            refreshUserData
        });

        renderDashboard();
        
        const redeemBtns = screen.getAllByText('Not Enough Points');
        expect(redeemBtns[0]).toBeDisabled();
    });
});
