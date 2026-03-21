import React from 'react';

// ---------------------------------------------------------------------------
// Base Skeleton primitive
// ---------------------------------------------------------------------------
interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
    <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} aria-hidden="true" />
);

// ---------------------------------------------------------------------------
// SkeletonJobCard — mirrors the JobCard grid layout
// ---------------------------------------------------------------------------
export const SkeletonJobCard: React.FC = () => (
    <div
        className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5 shadow-soft"
        aria-label="Loading job card"
        role="status"
    >
        {/* Status + title */}
        <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
        </div>
        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full col-span-2" />
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/5" />
        </div>
    </div>
);

// ---------------------------------------------------------------------------
// SkeletonShortlistCard — mirrors the ShortlistCard layout
// ---------------------------------------------------------------------------
export const SkeletonShortlistCard: React.FC = () => (
    <div
        className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-soft"
        aria-label="Loading recommendation"
        role="status"
    >
        <div className="flex gap-4">
            {/* Logo placeholder */}
            <Skeleton className="h-14 w-14 rounded-xl flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-2/3" />
                <div className="flex gap-3">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
        </div>
        {/* AI reasoning block */}
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
        </div>
        {/* Footer */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-4">
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
        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft flex flex-col gap-6"
        aria-label="Loading dashboard section"
        role="status"
    >
        {/* Card header */}
        <div className="flex justify-between items-start">
            <div className="flex flex-col gap-3 w-1/2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-14 w-28 rounded-xl" />
        </div>
        {/* Content rows */}
        <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-14 w-full rounded-xl" />
            </div>
            <div className="flex flex-col gap-3">
                <Skeleton className="h-3 w-24" />
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-28 rounded-full" />
                </div>
            </div>
        </div>
    </div>
);
