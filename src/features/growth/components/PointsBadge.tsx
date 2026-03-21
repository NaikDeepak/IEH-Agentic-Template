import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Trophy } from 'lucide-react';

export const PointsBadge: React.FC<{ showLabel?: boolean }> = ({ showLabel = true }) => {
    const { userData } = useAuth();
    const rawPoints = userData?.browniePoints;
    const points = Number.isFinite(Number(rawPoints)) ? Number(rawPoints) : 0;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
            <Trophy className={`w-4 h-4 ${points > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
            <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-amber-700">{points}</span>
                {showLabel && <span className="text-[9px] text-amber-500 tracking-wide">Brownie Points</span>}
            </div>
        </div>
    );
};
