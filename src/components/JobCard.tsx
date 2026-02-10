import React from 'react';
import { ArrowUpRight, Users } from 'lucide-react';
import { Timestamp, FieldValue } from 'firebase/firestore';
import { StatusBadge } from './StatusBadge';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  matchScore?: number;
  className?: string;
  onClick?: () => void;
  onViewApplicants?: (e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, matchScore, className = '', onClick, onViewApplicants }) => {
  const { title, location, type, salaryRange, status, expiresAt, createdAt } = job;

  const formatSalary = (range: NonNullable<Job['salaryRange']>) => {
    return `${range.currency} ${range.min.toLocaleString()} - ${range.max.toLocaleString()}`;
  };

  // Helper to safely handle Timestamp/FieldValue for display
  const getDisplayDate = (date: Timestamp | FieldValue | undefined) => {
    if (!date || date instanceof FieldValue) return null;
    return date instanceof Timestamp ? date : date;
  };

  const getRelativeTime = (date: Timestamp | FieldValue | undefined) => {
    if (!date || date instanceof FieldValue) return 'JUST NOW';
    // If it's a Timestamp, convert to Date
    const d = date instanceof Timestamp ? date.toDate() : new Date(); // Fallback

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return 'JUST NOW';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}M AGO`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}H AGO`;
    return `${Math.floor(diffInSeconds / 86400)}D AGO`;
  };

  const getMatchScoreColor = (score: number) => {
    // Minimalist color coding: Black/White/Gray scale with single accent
    if (score >= 80) return 'bg-black text-white border-black';
    if (score >= 50) return 'bg-gray-200 text-black border-gray-200';
    return 'bg-white text-gray-500 border-gray-200';
  };

  return (
    <div
      className={`group relative bg-white border-2 border-black p-6 flex flex-col gap-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${className}`}
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
      {/* Header Section */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge
              status={status}
              expiresAt={getDisplayDate(expiresAt)}
              showLabel={false}
              className="!p-0 !bg-transparent !border-0"
            />
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
               {status === 'active' ? 'Active Hiring' : 'Closed'}
            </span>
          </div>
          <h3 className="font-bold text-xl leading-tight text-black group-hover:text-[#003366] transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wide">Company Name</p>
        </div>

        {matchScore !== undefined && (
          <div className={`px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border ${getMatchScoreColor(matchScore)}`}>
            {Math.round(matchScore)}% Match
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-2 border-t border-gray-100 pt-4">
        {location && (
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-0.5">Location</span>
            <span className="text-sm font-semibold text-black truncate">{location}</span>
          </div>
        )}
        {type && (
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-0.5">Type</span>
            <span className="text-sm font-semibold text-black capitalize truncate">{type.replace('-', ' ')}</span>
          </div>
        )}
        {salaryRange && (
          <div className="col-span-2 flex flex-col">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-0.5">Salary Range</span>
            <span className="text-sm font-mono font-medium text-black truncate">{formatSalary(salaryRange)}</span>
          </div>
        )}
      </div>

      {/* Footer / Action */}
      <div className="mt-auto pt-4 flex items-center justify-between border-t-2 border-black">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-gray-400 uppercase tracking-wider">
           <span>Posted {getRelativeTime(createdAt)}</span>
        </div>

        <div className="flex items-center gap-4">
          {onViewApplicants && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewApplicants(e);
              }}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1.5 hover:bg-gray-800 transition-colors"
            >
              <Users className="w-3 h-3" />
              Applicants
            </button>
          )}
          <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-black group-hover:underline decoration-2 underline-offset-4">
            View Details
            <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
