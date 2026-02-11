import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Application } from '../../../applications/types';
import { Calendar, Building2 } from 'lucide-react';
import { FollowUpNudge } from './FollowUpNudge';

interface SeekerApplicationCardProps {
    application: Application;
}

export const SeekerApplicationCard: React.FC<SeekerApplicationCardProps> = ({ application }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: application.id ?? '',
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    // Helper to format timestamp
    const formatDate = (date: unknown) => {
        if (!date) return 'Unknown';

        // Type guard for Firestore Timestamp
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
                bg-white border-2 border-black p-4 mb-4 cursor-grab active:cursor-grabbing
                hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
                ${isDragging ? 'opacity-50 shadow-none z-50' : 'opacity-100'}
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-black text-sm uppercase tracking-tight">
                        {application.candidate_role ?? 'Position Applied'}
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase">
                        <Building2 className="w-3 h-3" />
                        Company Name
                    </div>
                </div>
                <div className="bg-black text-white px-1.5 py-0.5 text-[9px] font-black uppercase">
                    {Math.round(application.match_score)}% Match
                </div>
            </div>

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-[9px] font-mono text-gray-400 uppercase">
                    <Calendar className="w-2.5 h-2.5" />
                    Applied: {formatDate(application.applied_at)}
                </div>
            </div>

            {application.needsFollowUp && (
                <FollowUpNudge reason={application.nudgeReason ?? ''} />
            )}
        </div>
    );
};
