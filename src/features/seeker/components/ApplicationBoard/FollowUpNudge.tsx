import React from 'react';
import { AlertCircle, Mail } from 'lucide-react';

interface FollowUpNudgeProps {
    reason?: string;
}

export const FollowUpNudge: React.FC<FollowUpNudgeProps> = ({ reason }) => {
    return (
        <div className="mt-3 bg-yellow-50 border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2">
            <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tighter leading-tight">
                        Follow-up Nudge
                    </span>
                    <span className="text-[9px] font-medium text-gray-700 leading-tight">
                        {reason ?? "Stagnant application - consider reaching out."}
                    </span>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    // In a real app, this might open an email template or a modal
                    window.open('mailto:?subject=Follow up on my application', '_blank');
                }}
                className="flex items-center justify-center gap-1.5 bg-black text-white py-1 px-2 text-[9px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
                <Mail className="w-3 h-3" />
                Send Follow-up
            </button>
        </div>
    );
};
