import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Application } from '../types';
import { User, Briefcase, Zap } from 'lucide-react';

interface ApplicantCardProps {
    application: Application;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({ application }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: application.id ?? '',
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                bg-white border-2 border-black p-4 mb-3 cursor-grab active:cursor-grabbing
                hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
                ${isDragging ? 'opacity-50 shadow-none' : 'opacity-100'}
            `}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 border border-black flex items-center justify-center">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm leading-tight uppercase truncate max-w-[120px]">
                            {application.candidate_name ?? 'Anonymous'}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono uppercase">
                            <Briefcase className="w-2 h-2" />
                            {application.candidate_role ?? 'Developer'}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 bg-black text-white px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter">
                        <Zap className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                        {Math.round(application.match_score)}%
                    </div>
                </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
                <p className="text-[9px] font-mono text-gray-400 uppercase tracking-widest leading-none">
                    Applied Recently
                </p>
            </div>
        </div>
    );
};
