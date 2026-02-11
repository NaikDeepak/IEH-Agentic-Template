import React, { useState, useEffect } from 'react';
import { getMarketData, type MarketDataResponse } from '../../services/marketService';
import { TrendingUp, AlertCircle, Loader2, Info } from 'lucide-react';

interface MarketTrendsProps {
  role: string;
  country?: string;
}

export const MarketTrends: React.FC<MarketTrendsProps> = ({ role, country = 'in' }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MarketDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!role) return;

      setLoading(true);
      setError(null);

      try {
        const result = await getMarketData(role, country);
        if (isMounted) {
          setData(result);
        }
      } catch {
        if (isMounted) {
          setError('An unexpected error occurred while fetching market trends.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [role, country]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Analyzing market trends for "{role}"...</p>
      </div>
    );
  }

  if (error || !data?.available) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Data Unavailable</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          {data?.message ?? "We couldn't find enough recent salary data for this specific role in your region to provide an accurate trend."}
        </p>
        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-left max-w-md mx-auto">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Try searching for a more general job title (e.g., "Software Engineer" instead of "Junior React Native Developer") to get better market insights.
          </p>
        </div>
      </div>
    );
  }

  const { stats } = data;

  if (!stats) return null;

  // Format currency based on country
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(country === 'in' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: country === 'in' ? 'INR' : 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Market Insights</h3>
          <p className="text-sm text-gray-500">Based on recent job listings for {role}</p>
        </div>
        <div className="bg-green-100 p-2 rounded-lg">
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Average Salary</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.average)}</p>
          <p className="text-xs text-gray-500 mt-1">per year</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Median Salary</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.median)}</p>
          <p className="text-xs text-gray-500 mt-1">50th percentile</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Market Range</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(stats.min)} - {formatCurrency(stats.max)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Min to Max observed</p>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Sample Size:</strong> Analysis based on {stats.sampleSize.toLocaleString()} active job postings in this region.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          Powered by Adzuna Market Data
        </p>
      </div>
    </div>
  );
};
