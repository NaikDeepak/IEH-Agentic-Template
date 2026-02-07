import React from 'react';
import { MapPin, Briefcase, Clock, DollarSign } from 'lucide-react';
import { Timestamp, FieldValue } from 'firebase/firestore';
import { StatusBadge } from './StatusBadge';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  className?: string;
  onClick?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, className = '', onClick }) => {
  const { title, location, type, salaryRange, status, expiresAt, createdAt } = job;

  const formatSalary = (range: NonNullable<Job['salaryRange']>) => {
    return `${range.currency} ${range.min.toLocaleString()} - ${range.max.toLocaleString()}`;
  };

  // Helper to safely handle Timestamp/FieldValue for display
  const getDisplayDate = (date: Timestamp | FieldValue | undefined) => {
    if (!date || date instanceof FieldValue) return null;
    return date instanceof Timestamp ? date : date; // Assuming it could be Date if we loosen types later, but for now strict
  };

  const getRelativeTime = (date: Timestamp | FieldValue | undefined) => {
    if (!date || date instanceof FieldValue) return 'Just now';
    // If it's a Timestamp, convert to Date
    const d = date instanceof Timestamp ? date.toDate() : new Date(); // Fallback

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

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
        <div>
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Company Name</p>
        </div>
        <StatusBadge
          status={status}
          expiresAt={getDisplayDate(expiresAt)}
        />
      </div>

      <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600">
        {location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{location}</span>
          </div>
        )}
        {type && (
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span className="capitalize">{type.replace('-', ' ')}</span>
          </div>
        )}
        {salaryRange && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span>{formatSalary(salaryRange)}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
           <Clock className="w-3.5 h-3.5" />
           <span>{getRelativeTime(createdAt)}</span>
        </div>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
          View Details
        </button>
      </div>
    </div>
  );
};
