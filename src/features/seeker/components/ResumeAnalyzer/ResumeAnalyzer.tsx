import React, { useState, useEffect } from 'react';
import { ResumeInput } from './ResumeInput';
import { AnalysisDisplay } from './AnalysisDisplay';
import { analyzeResume, getLatestResume } from '../../services/resumeService';
import type { ResumeAnalysisResult } from '../../types';
import { useAuth } from '../../../../hooks/useAuth';
import { AlertCircle, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import * as Sentry from '@sentry/react';

type View = 'existing' | 'upload' | 'result';

export const ResumeAnalyzer: React.FC = () => {
    const { user } = useAuth();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingExisting, setLoadingExisting] = useState(true);
    const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<View>('upload');

    // On mount, load the most recent analysis if one exists
    useEffect(() => {
        const loadExisting = async () => {
            if (!user) {
                setLoadingExisting(false);
                return;
            }
            try {
                const existing = await getLatestResume(user.uid);
                if (existing) {
                    setResult(existing);
                    setView('existing');
                }
            } catch {
                // silently ignore — fall through to upload view
            } finally {
                setLoadingExisting(false);
            }
        };
        void loadExisting();
    }, [user]);

    const handleAnalyze = async (data: { type: 'file' | 'text' | 'linkedin'; content: File | string }) => {
        if (!user) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const analysisResult = await analyzeResume(user.uid, data.content, data.type);
            setResult(analysisResult);
            setView('result');
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
        setView('upload');
        setError(null);
    };

    if (loadingExisting) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-7 h-7 border-2 border-sky-700 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Loading your resume...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">AI-Powered</span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-1">Resume Intelligence</h2>
                    <p className="text-sm text-slate-400 mt-1">Upload your CV to get an ATS score, keyword analysis, and improvement suggestions.</p>
                </div>
                {(view === 'existing' || view === 'result') && (
                    <button
                        onClick={() => { setView('upload'); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0"
                    >
                        <UploadCloud size={15} />
                        Upload New CV
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-sm text-red-600">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                </div>
            )}

            {view === 'upload' ? (
                <ResumeInput onSubmit={handleAnalyze} isLoading={isAnalyzing} />
            ) : (
                result && <AnalysisDisplay result={result} onReset={handleReset} />
            )}
        </div>
    );
};
