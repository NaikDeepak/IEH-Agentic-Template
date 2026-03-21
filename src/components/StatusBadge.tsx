import React from 'react';
import { Timestamp } from 'firebase/firestore';
import type { ActivityStatus } from '../types';

interface StatusBadgeProps {
  status: ActivityStatus;
  expiresAt?: Timestamp | Date | null;
  className?: string;
  showLabel?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  expiresAt,
  className = '',
  showLabel = true
}) => {
  const isActive = status === 'active';
  const isPassive = status === 'passive';

  let tooltipText = status.charAt(0).toUpperCase() + status.slice(1);

  if (isActive && expiresAt) {
    let expiryDate: Date;

    // Handle FireStore Timestamp or serialized object
    if (typeof (expiresAt as { toDate?: () => Date }).toDate === 'function') {
      expiryDate = (expiresAt as { toDate: () => Date }).toDate();
    } else if (typeof (expiresAt as { seconds?: number }).seconds === 'number') {
      expiryDate = new Date((expiresAt as { seconds: number }).seconds * 1000);
    } else if (expiresAt instanceof Date) {
      expiryDate = expiresAt;
    } else {
      // Fallback for strings or numbers
      expiryDate = new Date(expiresAt as unknown as string | number);
    }

    // Only proceed if we have a valid date
    if (!isNaN(expiryDate.getTime())) {
      const now = new Date();
      // Calculate difference in days
      const diffTime = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining > 0) {
        tooltipText = `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
      } else {
        tooltipText = 'Expiring soon';
      }
    }
  }

  const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-colors";
  const activeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
  const passiveClasses = "bg-slate-100 text-slate-400 border-slate-200";
  const closedClasses = "bg-red-50 text-red-600 border-red-200";

  return (
    <div
      className={`${baseClasses} ${isActive ? activeClasses : isPassive ? passiveClasses : closedClasses} ${className}`}
      title={tooltipText}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : isPassive ? 'bg-slate-400' : 'bg-red-500'}`} aria-hidden="true" />
      {showLabel && (
        <span>{status}</span>
      )}
    </div>
  );
};
