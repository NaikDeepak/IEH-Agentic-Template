import React from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Application } from '../../../applications/types';
import { Calendar, Building2, ExternalLink } from 'lucide-react';
import { FollowUpNudge } from './FollowUpNudge';

interface SeekerApplicationCardProps {
    application: Application;
    isReadOnly?: boolean;
}

export const SeekerApplicationCard: React.FC<SeekerApplicationCardProps> = ({
    application,
    isReadOnly = false
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: application.id ?? '',
        disabled: isReadOnly
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const formatDate = (date: unknown) => {
        if (!date) return 'Unknown';
        const isTimestamp = (val: unknown): val is { toDate: () => Date } => {
            return !!(val && typeof (val as { toDate?: unknown }).toDate === 'function');
        };
        const d = isTimestamp(date) ? date.toDate() : new Date(date as string | number | Date);
        return d instanceof Date && !isNaN(d.getTime()) ? d.toLocaleDateString() : 'Unknown';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                bg-white rounded-xl border border-slate-200 p-4 shadow-soft
                ${isReadOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
                hover:shadow-soft-md hover:border-slate-300 transition-all
                ${isDragging ? 'opacity-40 scale-[0.98]' : 'opacity-100'}
            `}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1 pr-2">
                    <h4 className="font-semibold text-sm text-slate-900 leading-tight truncate">
                        {application.candidate_role ?? 'Position Applied'}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        Company
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {application.job_id && (
                        <Link
                            to={`/jobs/${application.job_id}`}
                            onClick={(e) => { e.stopPropagation(); }}
                            onPointerDown={(e) => { e.stopPropagation(); }}
                            className="p-1 text-slate-300 hover:text-sky-600 rounded transition-colors"
                            aria-label="View job posting"
                            title="View job"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    )}
                    {application.match_score > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                            {Math.round(application.match_score)}%
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                <Calendar className="w-3 h-3" />
                Applied {formatDate(application.applied_at)}
            </div>

            {application.needsFollowUp && (
                <FollowUpNudge reason={application.nudgeReason ?? ''} />
            )}
        </div>
    );
};
