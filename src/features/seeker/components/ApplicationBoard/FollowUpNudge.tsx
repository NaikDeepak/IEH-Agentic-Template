import React from 'react';
import { AlertCircle, Mail } from 'lucide-react';

interface FollowUpNudgeProps {
    reason?: string;
}

export const FollowUpNudge: React.FC<FollowUpNudgeProps> = ({ reason }) => {
    return (
        <div className="mt-3 bg-amber-50 rounded-lg border border-amber-100 p-2.5 flex flex-col gap-2">
            <div className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <span className="text-[11px] font-semibold text-amber-800 block leading-tight">
                        Follow-up suggested
                    </span>
                    <span className="text-[10px] text-amber-700 leading-tight">
                        {reason ?? "This application hasn't moved — consider reaching out."}
                    </span>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    window.open('mailto:?subject=Follow up on my application', '_blank');
                }}
                className="flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white py-1 px-2 text-[10px] font-semibold rounded-md transition-colors"
            >
                <Mail className="w-3 h-3" />
                Send Follow-up
            </button>
        </div>
    );
};
