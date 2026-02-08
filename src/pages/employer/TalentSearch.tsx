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
        <div className="min-h-screen bg-white flex flex-col font-sans text-black">
            <div className="container mx-auto px-4 md:px-8 py-12 max-w-7xl">

                <div className="mb-12 border-b-2 border-black pb-8">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
                        Find Top<br/>Talent
                    </h1>
                    <p className="text-gray-500 font-mono uppercase tracking-wide text-sm max-w-xl border-l-4 border-black pl-6 py-2">
                        Use natural language to find the perfect candidate.
                        <span className="block text-black font-bold mt-1">Try "React developer with 3 years experience"</span>
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-16">
                    <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
                        <div className="flex border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform focus-within:-translate-y-1 focus-within:translate-x-1 focus-within:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                            <div className="pl-6 flex items-center justify-center border-r-2 border-black">
                                <Search className="h-6 w-6 text-black" />
                            </div>
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none px-6 py-5 text-black placeholder:text-gray-400 font-mono text-sm uppercase tracking-wider w-full"
                                placeholder="DESCRIBE THE IDEAL CANDIDATE..."
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); }}
                            />
                            <button
                                type="submit"
                                disabled={loading || !query.trim()}
                                className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#003366] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors border-l-2 border-black"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Area */}
                <div className="space-y-8">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200">
                            <Loader2 className="w-12 h-12 animate-spin text-black mb-6" />
                            <p className="font-mono text-sm font-bold uppercase tracking-widest text-gray-500">Scanning Talent Pool...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border-2 border-red-600 p-6 text-center">
                            <p className="font-mono text-sm font-bold text-red-600 uppercase tracking-wide">{error}</p>
                        </div>
                    )}

                    {!loading && !error && hasSearched && results.length === 0 && (
                        <div className="text-center py-24 border-2 border-dashed border-black bg-gray-50">
                            <p className="text-3xl font-black uppercase tracking-tight text-gray-300 mb-2">0 Matches Found</p>
                            <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-400">Try adjusting your criteria.</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-2 h-2 bg-black rounded-full"></span>
                                <h2 className="font-mono text-sm font-bold uppercase tracking-widest">
                                    {results.length} Candidates Found
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        <div className="py-24 text-center opacity-20">
                            <Search className="w-24 h-24 mx-auto mb-4 text-black" strokeWidth={1} />
                            <p className="text-4xl font-black uppercase tracking-tighter">Ready to Search</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
