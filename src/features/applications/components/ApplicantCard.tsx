import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Application } from '../types';
import { User, Briefcase, Zap } from 'lucide-react';

interface ApplicantCardProps {
    application: Application;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({ application }) => {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                bg-white rounded-xl border border-slate-200 p-4 cursor-grab active:cursor-grabbing
                shadow-soft hover:shadow-soft-md hover:border-sky-200 transition-all
                ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}
            `}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 flex-shrink-0">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm leading-tight text-slate-900 truncate max-w-[120px]">
                            {application.candidate_name ?? 'Anonymous'}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Briefcase className="w-2.5 h-2.5" />
                            {application.candidate_role ?? 'Developer'}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold rounded-full">
                    <Zap className="w-2.5 h-2.5" />
                    {Math.round(application.match_score)}%
                </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">
                    Applied Recently
                </p>
            </div>
        </div>
    );
};
