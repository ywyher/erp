"use client";

import { getAuthors } from "@/app/posts/actionts";
import MultipleSelector from "@/components/ui/multi-select";
import { useQuery } from "@tanstack/react-query";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component

export default function AuthorFilter() {
    const [authors, setAuthors] = useQueryState("authors", parseAsArrayOf(parseAsString));
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>(authors ?? []);

    const { data: authorsData, isLoading: isAuthorsLoading } = useQuery({
        queryKey: ["post-author-filter"],
        queryFn: async () => await getAuthors(),
    });

    useEffect(() => {
        setSelectedAuthors(authors ?? []);
    }, [authors]);

    if (isAuthorsLoading) {
        return <Skeleton className="h-10 w-full rounded-md" />;
    }

    if (!authorsData) return null; // Handle empty state

    return (
        <MultipleSelector
            className="w-full"
            defaultOptions={authorsData as { value: string; label: string }[]}
            value={authorsData.filter((option) => selectedAuthors.includes(option.value))}
            placeholder="Select Authors..."
            onChange={(selectedOptions) => {
                const values = selectedOptions.map((option) => option.value);
                setAuthors(values);
                setSelectedAuthors(values);
            }}
            emptyIndicator={
                <p className="text-lg leading-10 text-center text-gray-600 dark:text-gray-400">
                    No Authors with that name were found.
                </p>
            }
        />
    );
}