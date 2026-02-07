import React from 'react';
import { User, Briefcase, MapPin, ExternalLink, Star } from 'lucide-react';
import { CandidateSearchResult } from '../../../lib/ai/search';

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
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-gray-600 bg-gray-50 border-gray-200';
    };

    // Parse skills if they come as a string (CSV) or array
    const skillList = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
            ? skills.split(',').map(s => s.trim())
            : [];

    return (
        <div
            className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4 cursor-pointer group ${className}`}
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
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        {candidate.photoURL ? (
                            <img
                                src={candidate.photoURL}
                                alt={displayName ?? 'Candidate'}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <User className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {displayName ?? 'Anonymous Candidate'}
                        </h3>
                        {jobTitle && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {jobTitle}
                            </p>
                        )}
                    </div>
                </div>

                {matchScore !== undefined && (
                    <div className={`px-2 py-1 rounded-md border text-xs font-semibold flex items-center gap-1 ${getMatchScoreColor(matchScore)}`}>
                        <Star className="w-3 h-3 fill-current" />
                        {Math.round(matchScore)}% Match
                    </div>
                )}
            </div>

            {location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{location}</span>
                </div>
            )}

            {bio && (
                <p className="text-sm text-gray-600 line-clamp-2">
                    {bio}
                </p>
            )}

            {skillList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                    {skillList.slice(0, 5).map((skill, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700"
                        >
                            {skill}
                        </span>
                    ))}
                    {skillList.length > 5 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-500">
                            +{skillList.length - 5}
                        </span>
                    )}
                </div>
            )}

            <div className="mt-auto pt-4 flex items-center justify-end border-t border-gray-50">
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Profile <ExternalLink className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};
