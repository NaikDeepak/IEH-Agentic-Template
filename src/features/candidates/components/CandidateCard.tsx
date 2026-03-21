import React from 'react';
import { User, Briefcase, MapPin, ExternalLink, Star } from 'lucide-react';
import type { CandidateSearchResult } from '../../../lib/ai/search';

interface CandidateCardProps {
    candidate: CandidateSearchResult;
    className?: string;
    onClick?: () => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, className = '', onClick }) => {
    const {
        displayName,
        bio,
        skills,
        location,
        jobTitle,
        matchScore
    } = candidate;

    const getMatchScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
        if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-100';
        return 'text-slate-500 bg-slate-50 border-slate-200';
    };

    // Parse skills if they come as a string (CSV) or array
    const skillList = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
            ? skills.split(',').map(s => s.trim())
            : [];

    return (
        <div
            className={`group bg-white rounded-2xl border border-slate-200 shadow-soft p-5 flex flex-col gap-4 cursor-pointer hover:border-slate-300 hover:shadow-soft-md transition-all duration-200 ${className}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            }}
        >
            <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center bg-slate-50 flex-shrink-0 overflow-hidden">
                        {candidate.photoURL ? (
                            <img
                                src={candidate.photoURL}
                                alt={displayName ?? 'Candidate'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-slate-900 leading-tight mb-0.5">
                            {displayName ?? 'Anonymous'}
                        </h3>
                        {jobTitle && (
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {jobTitle}
                            </p>
                        )}
                    </div>
                </div>

                {matchScore !== undefined && (
                    <span className={`shrink-0 px-2.5 py-0.5 border rounded-full text-[11px] font-semibold flex items-center gap-1 ${getMatchScoreColor(matchScore)}`}>
                        <Star className="w-3 h-3 fill-current" />
                        {Math.round(matchScore)}%
                    </span>
                )}
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                {location && (
                    <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Location</span>
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {location}
                        </div>
                    </div>
                )}
                <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Bio</span>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {bio ?? "No bio available."}
                    </p>
                </div>
            </div>

            {skillList.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {skillList.slice(0, 5).map((skill, index) => (
                        <span
                            key={index}
                            className="px-2.5 py-0.5 text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-600 rounded-full"
                        >
                            {skill}
                        </span>
                    ))}
                    {skillList.length > 5 && (
                        <span className="px-2.5 py-0.5 text-[11px] font-medium bg-sky-50 border border-sky-100 text-sky-700 rounded-full">
                            +{skillList.length - 5}
                        </span>
                    )}
                </div>
            )}

            <button className="w-full py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 transition-colors flex items-center justify-center gap-1.5">
                View Profile <ExternalLink className="w-3 h-3" />
            </button>
        </div>
    );
};
