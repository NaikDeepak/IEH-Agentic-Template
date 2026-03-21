import React, { useState } from 'react';
import { ResumeInput } from './ResumeInput';
import { AnalysisDisplay } from './AnalysisDisplay';
import { analyzeResume } from '../../services/resumeService';
import type { ResumeAnalysisResult } from '../../types';
import { useAuth } from '../../../../hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as Sentry from '@sentry/react';

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
            toast.success('Resume analyzed! Scroll down to view your report.');
        } catch (err) {
            Sentry.captureException(err);
            console.error(err);
            const msg = "Failed to analyze resume. Please try again.";
            setError(msg + " " + (err instanceof Error ? err.message : ''));
            toast.error(msg);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setError(null);
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 pb-6">
                <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">AI-Powered</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">Resume Intelligence</h2>
                <p className="text-sm text-slate-400 mt-1">Upload your CV to get an ATS score, keyword analysis, and improvement suggestions.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-sm text-red-600">
                    <AlertCircle size={16} className="shrink-0" />
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
