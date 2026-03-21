import React, { useState, useEffect } from 'react';
import { getMarketData, type MarketDataResponse } from '../../services/marketService';
import { TrendingUp, AlertCircle, Info } from 'lucide-react';

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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8 flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-slate-500">Analyzing market trends for "{role}"...</p>
      </div>
    );
  }

  if (error || !data?.available) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8 text-center">
        <div className="w-12 h-12 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-6 h-6 text-orange-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Market Data Unavailable</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
          {data?.message ?? "We couldn't find enough recent salary data for this role in your region."}
        </p>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left max-w-sm mx-auto flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-500">
            Try a more general job title (e.g., "Software Engineer") for better insights.
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-slate-900">Market Insights</h3>
            {data.isCached && (
              <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                Cached
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Based on listings for {role}</p>
        </div>
        <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Average Salary</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.average)}</p>
          </div>
          <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-200">Per year</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Median Salary</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(stats.median)}</p>
          </div>
          <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-200">50th percentile</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Market Range</p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(stats.min)} – {formatCurrency(stats.max)}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-200">Min to max</p>
        </div>
      </div>

      <div className="px-6 pb-5">
        <div className="bg-sky-50 rounded-xl p-3.5 border border-sky-100 flex items-center gap-2.5">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <p className="text-xs text-sky-700 font-medium">
            Sample size: {stats.sampleSize.toLocaleString()} active job postings analyzed
          </p>
        </div>
      </div>

      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
          Powered by Adzuna Market Data
        </p>
      </div>
    </div>
  );
};
