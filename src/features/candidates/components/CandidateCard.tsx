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

    // Helper to determine match score color
    const getMatchScoreColor = (score: number) => {
        if (score >= 80) return 'text-white bg-black border-black';
        if (score >= 50) return 'text-black bg-gray-200 border-gray-200';
        return 'text-gray-400 bg-white border-gray-200';
    };

    // Parse skills if they come as a string (CSV) or array
    const skillList = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
            ? skills.split(',').map(s => s.trim())
            : [];

    return (
        <div
            className={`group bg-white border-2 border-black p-6 flex flex-col gap-6 cursor-pointer hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 ${className}`}
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
            <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 border-2 border-black flex items-center justify-center bg-gray-100 flex-shrink-0">
                        {candidate.photoURL ? (
                            <img
                                src={candidate.photoURL}
                                alt={displayName ?? 'Candidate'}
                                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all"
                            />
                        ) : (
                            <User className="w-8 h-8 text-black" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-black uppercase tracking-tight leading-none mb-1 group-hover:underline decoration-2 underline-offset-4">
                            {displayName ?? 'Anonymous'}
                        </h3>
                        {jobTitle && (
                            <p className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {jobTitle}
                            </p>
                        )}
                    </div>
                </div>

                {matchScore !== undefined && (
                    <div className={`px-2 py-1 border-2 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${getMatchScoreColor(matchScore)}`}>
                        <Star className="w-3 h-3 fill-current" />
                        {Math.round(matchScore)}% Match
                    </div>
                )}
            </div>

            <div className="border-t-2 border-black pt-4 grid grid-cols-2 gap-4">
                {location && (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">Location</span>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-black">
                            <MapPin className="w-4 h-4" />
                            <span>{location}</span>
                        </div>
                    </div>
                )}
                 <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1">Bio</span>
                     <p className="text-xs font-medium text-gray-600 line-clamp-2 leading-relaxed">
                        {bio ?? "No bio available."}
                    </p>
                </div>
            </div>

            {skillList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                    {skillList.slice(0, 5).map((skill, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border border-black bg-white text-black"
                        >
                            {skill}
                        </span>
                    ))}
                    {skillList.length > 5 && (
                        <span className="inline-flex items-center px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-black text-white">
                            +{skillList.length - 5}
                        </span>
                    )}
                </div>
            )}

            <button className="w-full mt-2 py-3 border-2 border-black font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
                View Profile <ExternalLink className="w-3 h-3" />
            </button>
        </div>
    );
};
