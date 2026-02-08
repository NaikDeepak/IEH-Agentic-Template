import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
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
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Top Talent</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Use natural language to find the perfect candidate.
                        Try "React developer with 3 years experience" or "Marketing manager in Bangalore".
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="Describe the candidate you are looking for..."
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                        </button>
                    </form>
                </div>

                {/* Results Area */}
                <div className="space-y-6">
                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                                <p className="text-gray-500">Searching our talent pool...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-center">
                            {error}
                        </div>
                    )}

                    {!loading && !error && hasSearched && results.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                            <p className="text-gray-500 text-lg">No candidates found matching your criteria.</p>
                            <p className="text-gray-400 text-sm mt-2">Try adjusting your query or being less specific.</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map((candidate) => (
                                <CandidateCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    onClick={() => {
                                        // Placeholder for viewing candidate details
                                        // Placeholder for viewing candidate details
                                        // View candidate logic here
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {!hasSearched && !loading && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">Enter a query above to start searching.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
