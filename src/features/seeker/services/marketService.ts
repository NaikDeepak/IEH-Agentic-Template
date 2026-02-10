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
  histogram?: Record<string, number>;
  stats?: MarketStats;
}

/**
 * Fetches market salary data for a specific role and country using the Cloud Function proxy.
 */
export const getMarketData = async (role: string, country = 'in'): Promise<MarketDataResponse> => {
  const functions = getFunctions();
  const marketProxy = httpsCallable<{ role: string; country: string }, MarketDataResponse>(
    functions,
    'marketProxy'
  );

  try {
    const result = await marketProxy({ role, country });
    return result.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return {
      role,
      country,
      available: false,
      message: 'Failed to connect to market data service. Please try again later.'
    };
  }
};
