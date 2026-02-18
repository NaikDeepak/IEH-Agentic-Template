import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MarketTrends } from '../../../src/features/seeker/components/Market/MarketTrends';
import { getMarketData } from '../../../src/features/seeker/services/marketService';

vi.mock('../../../src/features/seeker/services/marketService', () => ({
    getMarketData: vi.fn()
}));

describe('MarketTrends', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        (getMarketData as any).mockReturnValue(new Promise(() => { })); // Never resolves
        render(<MarketTrends role="Senior Frontend Developer" />);
        expect(screen.getByText(/Analyzing market trends for "Senior Frontend Developer"/i)).toBeInTheDocument();
    });

    it('renders market data after loading', async () => {
        const mockData = {
            available: true,
            stats: {
                average: 120000,
                median: 115000,
                min: 90000,
                max: 180000,
                sampleSize: 450
            },
            trendingSkills: [],
            salaryInsights: [],
            isCached: false,
            message: ''
        };
        (getMarketData as any).mockResolvedValue(mockData);

        render(<MarketTrends role="Senior Frontend Developer" country="us" />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Market Insights/i })).toBeInTheDocument();
            expect(screen.getByText(/120,000/)).toBeInTheDocument();
            expect(screen.getByText(/115,000/)).toBeInTheDocument();
            expect(screen.getByText(/450 Active Job Postings/i)).toBeInTheDocument();
        });
    });

    it('handles error state gracefully', async () => {
        (getMarketData as any).mockRejectedValue(new Error('Network Error'));

        render(<MarketTrends role="Senior Frontend Developer" country="us" />);

        await waitFor(() => {
            expect(screen.queryByText(/Analyzing/i)).toBeNull();
        });
    });
});
