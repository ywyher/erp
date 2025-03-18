"use client"

import MultipleSelector from "@/components/ui/multi-select";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";

export default function CategoryFilter() {
    const [category, setCategory] = useQueryState('category', parseAsArrayOf(parseAsString))

    const categories = [
        {
            label: 'News',
            value: "news"
        },
        {
            label: 'Article',
            value: "article"
        }
    ]

    useEffect(() => {
        console.log(category)
    }, [category])

    return (
        <MultipleSelector
            className="w-full"
            defaultOptions={categories as { value: string; label: string }[]}
            placeholder={`Select Categories...`}
            onChange={(selectedOptions) => {
                setCategory(selectedOptions.map(option => option.value));
            }}
            emptyIndicator={
                <p className="text-lg leading-10 text-center text-gray-600 dark:text-gray-400">
                    No Category with that name were found.
                </p>
            }
        />
    )
}