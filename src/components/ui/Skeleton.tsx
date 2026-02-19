import React from 'react';

// ---------------------------------------------------------------------------
// Base Skeleton primitive
// ---------------------------------------------------------------------------
interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
    <div className={`animate-pulse bg-gray-200 ${className}`} aria-hidden="true" />
);

// ---------------------------------------------------------------------------
// SkeletonJobCard — mirrors the JobCard grid layout
// ---------------------------------------------------------------------------
export const SkeletonJobCard: React.FC = () => (
    <div
        className="border-2 border-gray-200 p-6 flex flex-col gap-4 shadow-[4px_4px_0px_0px_rgba(229,231,235,1)]"
        aria-label="Loading job card"
        role="status"
    >
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />
        {/* Company row */}
        <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-1/3" />
        </div>
        {/* Meta row */}
        <div className="flex gap-3">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
        </div>
        {/* Salary + type tags */}
        <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
        </div>
    </div>
);

// ---------------------------------------------------------------------------
// SkeletonShortlistCard — mirrors the ShortlistCard layout
// ---------------------------------------------------------------------------
export const SkeletonShortlistCard: React.FC = () => (
    <div
        className="border-2 border-gray-200 p-6 flex flex-col gap-4 shadow-[8px_8px_0px_0px_rgba(229,231,235,1)]"
        aria-label="Loading recommendation"
        role="status"
    >
        <div className="flex gap-4">
            {/* Company logo placeholder */}
            <Skeleton className="h-16 w-16 flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-3">
                {/* Active indicator + title */}
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-2/3" />
                {/* Meta row */}
                <div className="flex gap-4">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
        </div>
        {/* AI reasoning block */}
        <div className="border-2 border-gray-200 p-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-16" />
        </div>
    </div>
);

// ---------------------------------------------------------------------------
// SkeletonDashboardCard — mirrors the stats / profile card sections
// ---------------------------------------------------------------------------
export const SkeletonDashboardCard: React.FC = () => (
    <div
        className="border-4 border-gray-200 p-6 shadow-[8px_8px_0px_0px_rgba(229,231,235,1)] flex flex-col gap-6"
        aria-label="Loading dashboard section"
        role="status"
    >
        {/* Card header */}
        <div className="flex justify-between items-start">
            <div className="flex flex-col gap-3 w-1/2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-16 w-32" />
        </div>
        {/* Content rows */}
        <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-16 w-full" />
            </div>
            <div className="flex flex-col gap-3">
                <Skeleton className="h-3 w-24" />
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-7 w-28" />
                </div>
            </div>
        </div>
    </div>
);
