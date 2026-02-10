import React, { useState } from 'react';
import { ResumeInput } from './ResumeInput';
import { AnalysisDisplay } from './AnalysisDisplay';
import { analyzeResume } from '../../services/resumeService';
import { ResumeAnalysisResult } from '../../types';
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Resume AI Analyzer</h2>
                <p className="text-slate-600">Get instant feedback on your resume and match with top jobs.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 border border-red-200">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {!result ? (
                <ResumeInput onSubmit={handleAnalyze} isLoading={isAnalyzing} />
            ) : (
                <AnalysisDisplay result={result} onReset={handleReset} />
            )}
        </div>
    );
};
