import React from 'react';
import { cn } from '../../lib/utils';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
            {...props}
        />
    );
};

const SkeletonCard = () => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <div className="space-y-3">
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
            </div>
        </div>
    );
};

const SkeletonStats = () => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
            </div>
        </div>
    );
};

const SkeletonProfile = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
            <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Profile Card Skeleton */}
                <div className="w-full md:w-80 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center space-y-4">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <div className="flex gap-2 w-full">
                        <Skeleton className="h-10 flex-1 rounded-lg" />
                    </div>
                    <div className="w-full space-y-3 pt-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1 w-full space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <SkeletonStats key={i} />
                        ))}
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <Skeleton className="h-40 w-full rounded-lg" />
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SkeletonDashboard = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <div className="flex space-x-3">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <SkeletonStats key={i} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex space-x-3">
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
};

const SkeletonCourseCard = () => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-6 flex-1 flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
            </div>
        </div>
    );
};

const LiveClassesSkeleton = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-6 w-96" />
                    </div>
                    <Skeleton className="h-10 w-40 rounded-lg" />
                </div>

                {/* Tabs */}
                <div className="mb-8 flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-40 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <SkeletonCourseCard key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export { Skeleton, SkeletonCard, SkeletonStats, SkeletonProfile, SkeletonDashboard, SkeletonCourseCard, LiveClassesSkeleton };
