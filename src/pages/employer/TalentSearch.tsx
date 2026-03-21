import React, { useState } from 'react';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { searchCandidates } from '../../lib/ai/search';
import type { CandidateSearchResult } from '../../lib/ai/search';
import { CandidateCard } from '../../features/candidates/components/CandidateCard';

export const TalentSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CandidateSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setHasSearched(true);
        setResults([]); // Clear previous results while loading

        try {
            const candidates = await searchCandidates(query);
            setResults(candidates);
        } catch (err) {
            console.error('Search failed:', err);
            setError('Failed to fetch candidates. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <div className="container mx-auto px-4 md:px-8 py-12 max-w-7xl">

                <div className="mb-10 border-b border-slate-200 pb-8">
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest mb-2 block">AI Talent Search</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                        Find Top Talent
                    </h1>
                    <p className="text-sm text-slate-500 max-w-xl border-l-4 border-sky-300 pl-4 py-1">
                        Use natural language to find the perfect candidate.{' '}
                        <span className="text-slate-700 font-medium">Try "React developer with 3 years experience"</span>
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-10">
                    <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
                        <div className="flex bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-transparent transition-all">
                            <div className="pl-5 flex items-center justify-center">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none px-4 py-3.5 text-slate-900 placeholder:text-slate-400 text-sm w-full"
                                placeholder="Describe the ideal candidate..."
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); }}
                            />
                            <button
                                type="submit"
                                disabled={loading || !query.trim()}
                                className="bg-sky-700 hover:bg-sky-800 text-white px-6 py-3 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors rounded-r-xl"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Area */}
                <div className="space-y-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                            <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-4" />
                            <p className="text-sm text-slate-400">Scanning talent pool...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-600 text-center">
                            {error}
                        </div>
                    )}

                    {!loading && !error && hasSearched && results.length === 0 && (
                        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
                            <p className="text-xl font-semibold text-slate-400 mb-2">No matches found</p>
                            <p className="text-sm text-slate-400">Try adjusting your search criteria.</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-5">
                                <span className="w-2 h-2 bg-sky-600 rounded-full"></span>
                                <h2 className="text-sm font-semibold text-slate-700">
                                    {results.length} Candidates Found
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {results.map((candidate) => (
                                    <CandidateCard
                                        key={candidate.id}
                                        candidate={candidate}
                                        onClick={() => {
                                            // Placeholder for viewing candidate details
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {!hasSearched && !loading && (
                        <div className="py-24 text-center opacity-30">
                            <Search className="w-16 h-16 mx-auto mb-4 text-slate-400" strokeWidth={1} />
                            <p className="text-2xl font-semibold text-slate-400">Ready to search</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
