import React from 'react';
import type { ResumeAnalysisResult } from '../../types';
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, RefreshCw, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalysisDisplayProps {
    result: ResumeAnalysisResult;
    onReset: () => void;
}

// Determine score colors for Neo-Brutalist
const getScoreColors = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-400', stroke: 'stroke-black' };
    if (score >= 60) return { bg: 'bg-yellow-400', stroke: 'stroke-black' };
    return { bg: 'bg-red-400', stroke: 'stroke-black' };
};

// Circular Progress Component
const CircularProgress = ({ value }: { value: number }) => {
    const roundedValue = Math.round(value);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (roundedValue / 100 * circumference);
    const colors = getScoreColors(roundedValue);

    return (
        <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
            {/* Background Shape */}
            <div className={`absolute inset-4 rounded-full border-4 border-black ${colors.bg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}></div>

            <svg className="w-full h-full transform -rotate-90 relative z-10 overflow-visible">
                {/* Track */}
                <circle
                    cx="96"
                    cy="96"
                    r={radius}
                    className="stroke-black/10"
                    strokeWidth="16"
                    fill="transparent"
                />
                {/* Progress */}
                <motion.circle
                    cx="96"
                    cy="96"
                    r={radius}
                    className={colors.stroke}
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="square"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <span className="text-5xl font-black italic tracking-tighter">
                    {roundedValue}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Score</span>
            </div>
        </div>
    );
};

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, onReset }) => {
    const { score, sections, keywords, suggestions, parsed_data } = result;

    return (
        <div className="space-y-12">
            {/* Header / Primary Stats */}
            <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 -mr-32 -mt-32 rounded-full border-4 border-black"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <CircularProgress value={score} />
                    <div className="flex-grow space-y-6">
                        <div>
                            <div className="inline-block bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-3">
                                Analytics Report
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
                                {parsed_data.name ?? 'System Profile'}
                            </h2>
                        </div>
                        <p className="font-bold text-gray-500 max-w-2xl leading-relaxed uppercase text-sm tracking-tight">
                            Targeting high ATS compatibility.
                            {score >= 80
                                ? " Mission successful. Candidate is optimized for deployment."
                                : " Re-calibration recommended. Review identified gaps below."}
                        </p>
                        <button
                            onClick={onReset}
                            className="flex items-center gap-3 px-8 py-4 bg-black text-white border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-black uppercase tracking-tight text-sm italic"
                        >
                            <RefreshCw size={20} strokeWidth={3} />
                            Reset Analysis
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* 1. Section Check */}
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="bg-black text-white p-4 flex items-center justify-between">
                        <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-3">
                            <FileText size={20} />
                            Structural Integrity
                        </h3>
                    </div>
                    <div className="p-8 space-y-4">
                        {Object.entries(sections).map(([key, present]) => (
                            <div key={key} className="flex items-center justify-between p-4 border-2 border-black bg-gray-50 group hover:translate-x-2 transition-transform">
                                <span className="font-black uppercase text-xs tracking-widest truncate mr-4">
                                    {key}
                                </span >
                                {present ? (
                                    <span className="flex items-center gap-2 bg-emerald-400 text-black px-3 py-1 border-2 border-black text-[10px] font-black uppercase">
                                        <CheckCircle size={12} strokeWidth={3} /> Verified
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 bg-red-400 text-black px-3 py-1 border-2 border-black text-[10px] font-black uppercase italic">
                                        <XCircle size={12} strokeWidth={3} /> Missing
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Top Improvements */}
                <div className="bg-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="bg-black text-white p-4">
                        <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Lightbulb size={20} />
                            Optimization Log
                        </h3>
                    </div>
                    <div className="p-8 space-y-6">
                        {suggestions.length > 0 ? (
                            suggestions.map((suggestion, idx) => (
                                <div key={idx} className="flex gap-4 items-start bg-white p-5 border-2 border-black">
                                    <div className="min-w-[32px] h-8 flex items-center justify-center bg-black text-white font-black italic">
                                        {idx + 1}
                                    </div>
                                    <p className="font-bold text-xs uppercase leading-tight tracking-tight">{suggestion}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="font-black uppercase text-gray-400 italic">No optimizations required.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Keyword Analysis */}
                <div className="md:col-span-2 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-2 w-12 bg-indigo-600"></div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">Semantic Analysis</h3>
                        <div className="flex-grow h-2 bg-gray-100"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Found Keywords */}
                        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-400 border border-black"></div>
                                Detected Keywords
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {keywords.found.length > 0 ? (
                                    keywords.found.map((kw, idx) => (
                                        <span key={idx} className="px-3 py-2 bg-white border-2 border-black font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-default">
                                            {kw}
                                        </span>
                                    ))
                                ) : (
                                    <span className="font-bold uppercase text-gray-300 italic text-sm">Scan yielded no core keywords</span>
                                )}
                            </div>
                        </div>

                        {/* Missing Keywords */}
                        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-6 flex items-center gap-2">
                                <AlertTriangle size={14} strokeWidth={3} />
                                Targeted Semantic Voids
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {keywords.missing.length > 0 ? (
                                    keywords.missing.map((kw, idx) => (
                                        <span key={idx} className="px-3 py-2 bg-red-50 border-2 border-black text-red-600 font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_rgba(239,68,68,0.2)]">
                                            + {kw}
                                        </span>
                                    ))
                                ) : (
                                    <div className="flex items-center gap-3 bg-emerald-50 p-4 border-2 border-emerald-400 w-full">
                                        <CheckCircle className="text-emerald-500" size={20} strokeWidth={3} />
                                        <span className="font-black uppercase text-xs tracking-widest text-emerald-700">All target keywords present.</span>
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
