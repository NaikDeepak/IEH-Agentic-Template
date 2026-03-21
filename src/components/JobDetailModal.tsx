import React from 'react';
import { X, MapPin, Briefcase, Clock, DollarSign, Send } from 'lucide-react';
import { FocusTrap } from 'focus-trap-react';
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
      role="presentation"
    >
      <FocusTrap active={isOpen}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          className="bg-white rounded-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-soft-md relative animate-in zoom-in-95 duration-200"
          onClick={(e) => { e.stopPropagation(); }}
          onKeyDown={(e) => { if (e.key === 'Escape') onClose(); e.stopPropagation(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-detail-title"
          tabIndex={-1}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={job.status === 'active' ? 'active' : 'closed'} />
                <span className="text-xs text-slate-500">
                  {job.type.replace('_', ' ')} · {job.work_mode}
                </span>
              </div>
              <h2 id="job-detail-title" className="text-2xl font-bold text-slate-900 leading-tight mb-1">
                {job.title}
              </h2>
              <p className="text-sm text-slate-500">Company</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: MapPin, label: 'Location', value: job.location },
                { icon: Briefcase, label: 'Experience', value: job.experience },
                { icon: DollarSign, label: 'Salary', value: job.salary_range ? formatSalary(job.salary_range) : 'Competitive' },
                { icon: Clock, label: 'Posted', value: 'Recently' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Job Description</h3>
              <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                {job.description.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Skills */}
            {job.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-100 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-6 border-t border-slate-100">
              {alreadyApplied ? (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-sm font-semibold text-slate-400">
                  Already Applied
                </div>
              ) : (
                <button
                  onClick={onApply}
                  disabled={isApplying}
                  className="w-full flex items-center justify-center gap-2 bg-sky-700 hover:bg-sky-800 text-white py-3 px-6 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isApplying ? 'Processing...' : <><Send className="w-4 h-4" /> Apply Now</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};
