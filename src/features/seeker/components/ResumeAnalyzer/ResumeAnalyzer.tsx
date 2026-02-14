import React, { useState } from 'react';
import { ResumeInput } from './ResumeInput';
import { AnalysisDisplay } from './AnalysisDisplay';
import { analyzeResume } from '../../services/resumeService';
import type { ResumeAnalysisResult } from '../../types';
import { useAuth } from '../../../../hooks/useAuth';
import { AlertCircle } from 'lucide-react';

export const ResumeAnalyzer: React.FC = () => {
    const { user } = useAuth();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (data: { type: 'file' | 'text' | 'linkedin'; content: File | string }) => {
        if (!user) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const analysisResult = await analyzeResume(user.uid, data.content, data.type);
            setResult(analysisResult);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze resume. Please try again. " + (err instanceof Error ? err.message : ""));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-left mb-12 relative">
                <div className="h-2 w-24 bg-black mb-6"></div>
                <h2 className="text-6xl font-black uppercase tracking-tighter mb-4 italic leading-none">
                    Resume <br />Intelligence
                </h2>
                <div className="flex items-center gap-3">
                    <p className="font-mono text-sm font-bold uppercase tracking-widest text-gray-500">
                        Scan. Optimize. Conquer.
                    </p>
                    <div className="flex-grow h-px bg-gray-200"></div>
                </div>
            </div>

            {error && (
                <div className="bg-red-400 text-black p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                    <div className="bg-black p-2">
                        <AlertCircle size={24} className="text-white" />
                    </div>
                    <div className="font-bold uppercase text-sm tracking-tight">{error}</div>
                </div>
            )}

            <div className="relative">
                {!result ? (
                    <ResumeInput onSubmit={handleAnalyze} isLoading={isAnalyzing} />
                ) : (
                    <AnalysisDisplay result={result} onReset={handleReset} />
                )}
            </div>
        </div>
    );
};
