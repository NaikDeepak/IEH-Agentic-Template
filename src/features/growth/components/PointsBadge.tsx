import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Trophy } from 'lucide-react';

export const PointsBadge: React.FC<{ showLabel?: boolean }> = ({ showLabel = true }) => {
    const { userData } = useAuth();
    const rawPoints = userData?.browniePoints;
    const points = Number.isFinite(Number(rawPoints)) ? Number(rawPoints) : 0;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black border-2 border-black text-white hover:bg-white hover:text-black transition-all group">
            <Trophy className={`w-4 h-4 ${points > 0 ? 'text-yellow-400 group-hover:text-black' : 'text-gray-400'}`} />
            <div className="flex flex-col leading-none">
                <span className="text-[11px] font-black uppercase tracking-tight">{points}</span>
                {showLabel && <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-600">Brownie Points</span>}
            </div>
        </div>
    );
};
