import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMarketData } from '../../src/features/seeker/services/marketService';
import { httpsCallable } from 'firebase/functions';

// Mock Dependencies
vi.mock('firebase/functions', () => ({
    getFunctions: vi.fn(),
    httpsCallable: vi.fn()
}));

describe('MarketService', () => {
    const mockMarketProxy = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        (httpsCallable as any).mockReturnValue(mockMarketProxy);
    });

    describe('getMarketData', () => {
        it('should fetch data from Cloud Function and cache it', async () => {
            const mockResult = {
                data: {
                    role: 'Engineer',
                    country: 'in',
                    available: true,
                    stats: { average: 100000 }
                }
            };
            mockMarketProxy.mockResolvedValueOnce(mockResult);

            const data = await getMarketData('Engineer');

            expect(data.available).toBe(true);
            expect(localStorage.getItem('market_data_engineer_in')).not.toBeNull();
        });

        it('should return from cache on error', async () => {
            const cachedData = {
                role: 'Engineer',
                country: 'in',
                available: true,
                stats: { average: 90000 }
            };
            localStorage.setItem('market_data_engineer_in', JSON.stringify(cachedData));
            mockMarketProxy.mockRejectedValueOnce(new Error('Network Error'));

            const data = await getMarketData('Engineer');

            expect(data.isCached).toBe(true);
            expect(data.stats?.average).toBe(90000);
        });

        it('should return default fail state on error and no cache', async () => {
            mockMarketProxy.mockRejectedValueOnce(new Error('Network Error'));

            const data = await getMarketData('Engineer');

            expect(data.available).toBe(false);
            expect(data.message).toContain('Failed to connect');
        });
    });
});
