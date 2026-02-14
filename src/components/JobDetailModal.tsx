import React from 'react';
import { X, MapPin, Briefcase, Clock, DollarSign, Send } from 'lucide-react';
import type { JobPosting } from '../features/jobs/types';
import { StatusBadge } from './StatusBadge';

interface JobDetailModalProps {
  job: JobPosting;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  isApplying?: boolean;
  alreadyApplied?: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  isApplying,
  alreadyApplied
}) => {
  if (!isOpen) return null;

  const formatSalary = (range: NonNullable<JobPosting['salary_range']>) => {
    return `${range.currency} ${range.min.toLocaleString()} - ${range.max.toLocaleString()}`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      role="button"
      tabIndex={0}
      aria-label="Close modal"
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="bg-white border-4 border-black w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => { e.stopPropagation(); }}
        onKeyDown={(e) => { e.stopPropagation(); }}
        role="document"
        tabIndex={-1}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-8 border-b-4 border-black pb-8">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={job.status === 'active' ? 'active' : 'closed'} />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500">
                {job.type.replace('_', ' ')} • {job.work_mode}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-2">
              {job.title}
            </h2>
            <p className="text-xl font-bold text-gray-400 uppercase tracking-tight">
              Company Name
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 border-2 border-black flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase text-gray-400">Location</p>
                  <p className="font-bold">{job.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 border-2 border-black flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase text-gray-400">Experience</p>
                  <p className="font-bold">{job.experience}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 border-2 border-black flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase text-gray-400">Salary Range</p>
                  <p className="font-mono font-bold">{job.salary_range ? formatSalary(job.salary_range) : 'Competitive'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 border-2 border-black flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase text-gray-400">Posted</p>
                  <p className="font-bold">Recently</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-12">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 border-l-4 border-black pl-4">
              Job Description
            </h3>
            <div className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed">
              {job.description.split('\n').map((para, i) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="mb-12">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 border-l-4 border-black pl-4">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-gray-100 border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-tight"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-4 border-black">
            {alreadyApplied ? (
              <div className="flex-grow bg-gray-100 border-2 border-black p-4 text-center font-bold uppercase tracking-widest text-gray-500">
                Already Applied
              </div>
            ) : (
              <button
                onClick={onApply}
                disabled={isApplying}
                className="flex-grow flex items-center justify-center gap-3 bg-black text-white p-6 text-xl font-black uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isApplying ? (
                  <>Processing...</>
                ) : (
                  <>
                    Apply Now <Send className="w-6 h-6" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
