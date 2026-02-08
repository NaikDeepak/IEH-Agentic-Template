import React from 'react';
import { Circle } from 'lucide-react';
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

  let tooltipText = isActive ? 'Active' : 'Passive';

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

  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors";
  const activeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
  const passiveClasses = "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100";

  return (
    <div
      className={`${baseClasses} ${isActive ? activeClasses : passiveClasses} ${className}`}
      title={tooltipText}
    >
      <Circle
        className={`w-2 h-2 mr-1.5 fill-current ${isActive ? 'text-emerald-500' : 'text-gray-400'}`}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="capitalize">{status}</span>
      )}
    </div>
  );
};
