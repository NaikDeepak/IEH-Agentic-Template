import { getFunctions, httpsCallable } from 'firebase/functions';

export interface MarketStats {
  average: number;
  median: number;
  min: number;
  max: number;
  sampleSize: number;
}

export interface MarketDataResponse {
  role: string;
  country: string;
  available: boolean;
  message?: string;
  isCached?: boolean; // New flag for cached data
  histogram?: Record<string, number>;
  stats?: MarketStats;
}

/**
 * Fetches market salary data for a specific role and country using the Cloud Function proxy.
 */
export const getMarketData = async (role: string, country = 'in'): Promise<MarketDataResponse> => {
  const cacheKey = `market_data_${role.toLowerCase().replace(/\s+/g, '_')}_${country}`;
  const functions = getFunctions();
  const marketProxy = httpsCallable<{ role: string; country: string }, MarketDataResponse>(
    functions,
    'marketProxy'
  );

  try {
    const result = await marketProxy({ role, country });
    const data = result.data;

    // Cache successful responses
    if (data.available && data.stats) {
      localStorage.setItem(cacheKey, JSON.stringify({
        ...data,
        timestamp: Date.now()
      }));
    }

    return data;
  } catch (error) {
    console.error('Error fetching market data:', error);

    // Attempt to serve from cache
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as MarketDataResponse;
        return {
          ...parsed,
          isCached: true
        };
      } catch (parseError) {
        console.error('Error parsing cached market data:', parseError);
      }
    }

    return {
      role,
      country,
      available: false,
      message: 'Failed to connect to market data service. Please try again later.'
    };
  }
};
