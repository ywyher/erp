"use client";

import MultipleSelector from "@/components/ui/multi-select";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

export default function CategoryFilter() {
    const [categories, setCategories] = useQueryState('categories', parseAsArrayOf(parseAsString));
    const [selectedCategories, setSelectedCategories] = useState<string[]>(categories ?? []);

    const categoriesData = [
        { label: 'News', value: "news" },
        { label: 'Article', value: "article" }
    ];

    useEffect(() => {
        setSelectedCategories(categories ?? []);
    }, [categories]);

    return (
        <MultipleSelector
            className="w-full"
            defaultOptions={categoriesData}
            value={categoriesData.filter(option => selectedCategories.includes(option.value))}
            placeholder="Select Categories..."
            onChange={(selectedOptions) => {
                const values = selectedOptions.map(option => option.value);
                setCategories(values);
                setSelectedCategories(values);
            }}
            emptyIndicator={
                <p className="text-lg leading-10 text-center text-gray-600 dark:text-gray-400">
                    No Category with that name was found.
                </p>
            }
        />
    );
}