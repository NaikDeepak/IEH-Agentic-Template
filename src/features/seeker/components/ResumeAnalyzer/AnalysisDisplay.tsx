import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ResumeAnalysisResult } from '../../types';
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, FileText, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalysisDisplayProps {
    result: ResumeAnalysisResult;
    onReset: () => void;
}

const getScoreStyle = (score: number) => {
    if (score >= 80) return { stroke: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (score >= 60) return { stroke: '#f59e0b', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { stroke: '#ef4444', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
};

// Circular Progress Component
const CircularProgress = ({ value }: { value: number }) => {
    const roundedValue = Math.round(value);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (roundedValue / 100 * circumference);
    const style = getScoreStyle(roundedValue);

    return (
        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 overflow-visible">
                {/* Track */}
                <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    className="stroke-slate-100"
                    strokeWidth="10"
                    fill="transparent"
                />
                {/* Progress */}
                <motion.circle
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke={style.stroke}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${style.text}`}>
                    {roundedValue}
                </span>
                <span className="text-xs text-slate-400 mt-0.5">ATS Score</span>
            </div>
        </div>
    );
};

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, onReset }) => {
    const navigate = useNavigate();
    const { score, sections, keywords, suggestions, parsed_data } = result;

    const scoreStyle = getScoreStyle(Math.round(score));

    return (
        <div className="space-y-6">
            {/* Header / Primary Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <CircularProgress value={score} />
                    <div className="flex-grow space-y-4 text-center md:text-left">
                        <div>
                            <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">Analysis Complete</span>
                            <h2 className="text-2xl font-bold text-slate-900 mt-1">
                                {parsed_data.name ?? 'Your Resume'}
                            </h2>
                        </div>
                        <p className={`text-sm leading-relaxed ${scoreStyle.text}`}>
                            {score >= 80
                                ? "Great ATS compatibility. Your resume is well-optimised for automated screening."
                                : "Some improvements can boost your ATS score. Review the suggestions below."}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => { void navigate('/seeker/dashboard'); }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <ArrowLeft size={14} />
                                Back to Dashboard
                            </button>
                            <button
                                onClick={onReset}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-xl hover:bg-sky-100 transition-colors"
                            >
                                <Sparkles size={14} />
                                Optimise with AI
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Section Check */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                        <FileText size={15} className="text-slate-400" />
                        <h3 className="text-sm font-semibold text-slate-900">Resume Sections</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {Object.entries(sections).map(([key, present]) => (
                            <div key={key} className="flex items-center justify-between px-5 py-3">
                                <span className="text-sm text-slate-700 capitalize">
                                    {key}
                                </span>
                                {present ? (
                                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                                        <CheckCircle size={11} /> Present
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-100 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                                        <XCircle size={11} /> Missing
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Top Improvements */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                        <Lightbulb size={15} className="text-amber-500" />
                        <h3 className="text-sm font-semibold text-slate-900">Improvement Tips</h3>
                    </div>
                    <div className="p-5 space-y-3">
                        {suggestions.length > 0 ? (
                            suggestions.map((suggestion, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 w-5 h-5 bg-sky-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm text-slate-700 leading-relaxed">{suggestion}</p>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl border border-emerald-100 p-4">
                                <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                                <span className="text-sm font-medium text-emerald-700">No improvements needed — great resume!</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Keyword Analysis */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-900">Keyword Analysis</h3>
                    </div>
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        {/* Found Keywords */}
                        <div className="p-5">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                Found Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {keywords.found.length > 0 ? (
                                    keywords.found.map((kw, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-full text-xs font-medium">
                                            {kw}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-400 italic">No keywords detected</span>
                                )}
                            </div>
                        </div>

                        {/* Missing Keywords */}
                        <div className="p-5">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <AlertTriangle size={12} className="text-red-400" />
                                Missing Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {keywords.missing.length > 0 ? (
                                    keywords.missing.map((kw, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-medium">
                                            {kw}
                                        </span>
                                    ))
                                ) : (
                                    <div className="flex items-center gap-2 bg-emerald-50 rounded-lg border border-emerald-100 px-3 py-2">
                                        <CheckCircle className="text-emerald-500 shrink-0" size={14} />
                                        <span className="text-xs font-medium text-emerald-700">All target keywords present</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
