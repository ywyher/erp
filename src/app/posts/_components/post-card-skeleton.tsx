"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function PostCardSkeleton() {
    return (
        <div className="
            flex flex-col justify-between
            rounded-lg overflow-hidden shadow-lg bg-[#f9f9f9] dark:bg-[#121212] p-4
            border border-gray-300 dark:border-gray-700
            min-w-[320px] max-w-[320px] min-h-[450px]
        ">
            {/* Thumbnail Skeleton */}
            <Skeleton className="w-full h-48 rounded-md" />

            {/* Content Skeleton */}
            <div className="flex flex-col gap-3 mt-3">
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
            </div>

            {/* Author & Date Skeleton */}
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-20 rounded-md" />
                        <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-md" />
            </div>
        </div>
    );
}