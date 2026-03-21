import React from 'react';
import { ArrowUpRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Timestamp, FieldValue } from 'firebase/firestore';
import { StatusBadge } from './StatusBadge';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  matchScore?: number;
  className?: string;
  onClick?: () => void;
  onViewApplicants?: (e: React.MouseEvent) => void;
  onApply?: (e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, matchScore, className = '', onClick, onViewApplicants, onApply }) => {
  const { id, title, location, type, salaryRange, status, expiresAt, createdAt } = job;
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (id) {
      void navigate(`/jobs/${id}`);
    }
  };

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
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 50) return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-slate-100 text-slate-500 border-slate-200';
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 shadow-soft transition-all duration-200 hover:shadow-soft-md hover:border-sky-200 cursor-pointer ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
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
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              {status === 'active' ? 'Active Hiring' : 'Closed'}
            </span>
          </div>
          <h3 className="font-semibold text-lg leading-snug text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-slate-400 mt-1">Company Name</p>
        </div>

        {matchScore !== undefined && (
          <div className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border ${getMatchScoreColor(matchScore)}`}>
            {Math.round(matchScore)}% Match
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-2 border-t border-slate-100 pt-4">
        {location && (
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Location</span>
            <span className="text-sm font-semibold text-slate-700 truncate">{location}</span>
          </div>
        )}
        {type && (
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Type</span>
            <span className="text-sm font-semibold text-slate-700 capitalize truncate">{type.replace('-', ' ')}</span>
          </div>
        )}
        {salaryRange && (
          <div className="col-span-2 flex flex-col">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Salary Range</span>
            <span className="text-sm font-medium text-slate-700 truncate">{formatSalary(salaryRange)}</span>
          </div>
        )}
      </div>

      {/* Footer / Action */}
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
          Posted {getRelativeTime(createdAt)}
        </span>

        <div className="flex items-center gap-3">
          {onViewApplicants && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewApplicants(e);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Users className="w-3 h-3" />
              Applicants
            </button>
          )}
          {onApply && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApply(e);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Apply Now
            </button>
          )}
          <div className="flex items-center gap-1 text-xs font-semibold text-sky-700 group-hover:text-sky-800 transition-colors">
            View Details
            <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
