import React from 'react';
import { ResumeAnalysisResult } from '../../types';
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, RefreshCw, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalysisDisplayProps {
    result: ResumeAnalysisResult;
    onReset: () => void;
}

// Determine score color
const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 border-green-600';
    if (score >= 60) return 'text-yellow-600 border-yellow-600';
    return 'text-red-600 border-red-600';
};

const getScoreRingColor = (score: number) => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-yellow-500';
    return 'stroke-red-500';
};

// Circular Progress Component
const CircularProgress = ({ value }: { value: number }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-slate-100"
                    strokeWidth="12"
                    fill="transparent"
                />
                {/* Progress Ring */}
                <motion.circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className={getScoreRingColor(value)}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${getScoreColor(value).split(' ')[0]}`}>
                    {value}
                </span>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">ATS Score</span>
            </div>
        </div>
    );
};

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, onReset }) => {
    const { score, sections, keywords, suggestions, parsed_data } = result;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                    <CircularProgress value={score} />
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            {parsed_data.name ? `Analysis for ${parsed_data.name}` : 'Resume Analysis'}
                        </h2>
                        <p className="text-slate-500 max-w-md">
                            We've analyzed your resume against industry standards.
                            {score >= 80
                                ? " Excellent work! You're ready to apply."
                                : " Review the suggestions below to improve your chances."}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                >
                    <RefreshCw size={18} />
                    Analyze Another
                </button>
            </div>


            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Section Completeness */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="text-blue-600" size={20} />
                        Section Check
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 space-y-3">
                        {Object.entries(sections).map(([key, present]) => (
                            <div key={key} className="flex items-center justify-between group">
                                <span className="text-slate-600 font-medium capitalize group-hover:text-slate-900 transition-colors">
                                    {key}
                                </span>
                                {present ? (
                                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                        <CheckCircle size={14} /> Found
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-red-600 text-sm font-bold bg-red-50 px-2 py-1 rounded-md border border-red-100">
                                        <XCircle size={14} /> Missing
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Improvements / Suggestions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Lightbulb className="text-amber-500" size={20} />
                        Top Improvements
                    </h3>
                    <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100 space-y-3 h-full">
                        {suggestions.length > 0 ? (
                            suggestions.map((suggestion, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <div className="mt-1 min-w-[20px] h-5 flex items-center justify-center bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                        {idx + 1}
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed">{suggestion}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 italic">No specific suggestions found. Good job!</p>
                        )}
                    </div>
                </div>

                {/* 3. Keywords Analysis */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="text-purple-600" size={20} />
                        Keyword Gap Analysis
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Found Keywords */}
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Detected Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                                {keywords.found.length > 0 ? (
                                    keywords.found.map((kw, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg font-medium shadow-sm">
                                            {kw}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-400 text-sm italic">No strong keywords detected</span>
                                )}
                            </div>
                        </div>

                        {/* Missing Keywords */}
                        <div className="bg-red-50/30 rounded-xl p-6 border border-red-100">
                            <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                Missing Critical Keywords
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {keywords.missing.length > 0 ? (
                                    keywords.missing.map((kw, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-white border border-red-100 text-red-700 text-sm rounded-lg font-medium shadow-sm opacity-75 hover:opacity-100 transition-opacity">
                                            + {kw}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-green-600 text-sm font-medium flex items-center gap-2">
                                        <CheckCircle size={16} /> All key areas covered!
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
