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
      <div className="bg-white border-2 border-black p-8 flex flex-col items-center justify-center min-h-[300px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
        <p className="text-black font-mono font-bold uppercase tracking-widest text-sm">Analyzing market trends for "{role}"...</p>
      </div>
    );
  }

  if (error || !data?.available) {
    return (
      <div className="bg-white border-2 border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 -z-10"></div>
        <div className="bg-black text-white w-20 h-20 border-2 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <AlertCircle className="w-10 h-10 text-orange-400" />
        </div>
        <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-3">Market Data Unavailable</h3>
        <p className="text-gray-600 font-medium max-w-md mx-auto mb-8 border-l-4 border-black pl-6">
          {data?.message ?? "We couldn't find enough recent salary data for this specific role in your region to provide an accurate trend."}
        </p>
        <div className="bg-gray-50 p-5 border-2 border-black text-left max-w-md mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-black shrink-0 mt-0.5" />
            <p className="text-sm font-mono font-bold uppercase tracking-tight text-black">
              Tip: Try searching for a more general job title (e.g., "Software Engineer") to get better insights.
            </p>
          </div>
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
    <div className="bg-white border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="p-8 border-b-4 border-black flex items-center justify-between bg-white relative">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black opacity-10"></div>
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-4xl font-black text-black uppercase tracking-tighter">Market Insights</h3>
            {data.isCached && (
              <span className="bg-orange-400 text-black text-[10px] font-mono font-black px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                Offline Cache
              </span>
            )}
          </div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mt-1">
            BASED ON LISTINGS FOR {role.toUpperCase()}
          </p>
        </div>
        <div className="bg-black text-white p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <TrendingUp className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest mb-3">Average Salary</p>
            <p className="text-2xl font-black text-black tracking-tight">{formatCurrency(stats.average)}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-mono font-bold uppercase text-gray-400">PER YEAR</p>
          </div>
        </div>
        <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest mb-3">Median Salary</p>
            <p className="text-2xl font-black text-black tracking-tight">{formatCurrency(stats.median)}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-mono font-bold uppercase text-gray-400">50TH PERCENTILE</p>
          </div>
        </div>
        <div className="p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest mb-3">Market Range</p>
            <p className="text-xl font-black text-black tracking-tight leading-tight">
              {formatCurrency(stats.min)}<br />
              <span className="text-gray-400">—</span><br />
              {formatCurrency(stats.max)}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-mono font-bold uppercase text-gray-400">MIN TO MAX</p>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-black text-white p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <p className="text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-3">
            <Info className="w-4 h-4 text-emerald-400" />
            Sample Size: {stats.sampleSize.toLocaleString()} Active Job Postings Analyzed
          </p>
        </div>
      </div>

      <div className="bg-gray-100 px-8 py-4 border-t-2 border-black text-center">
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">
          POWERED BY ADZUNA MARKET DATA ENGINE
        </p>
      </div>
    </div>
  );
};
