"use client"

import AuthorFilter from "@/app/posts/_components/author-filter";
import CategoryFilter from "@/app/posts/_components/category-filter";
import TitleFilter from "@/app/posts/_components/title-filter";
import { Button } from "@/components/ui/button";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

export default function PostFilters() {
    const [,setTitle] = useQueryState("title");
    const [,setAuthors] = useQueryState('authors', parseAsArrayOf(parseAsString))
    const [,setCategories] = useQueryState('categories', parseAsArrayOf(parseAsString))

    const reset = () => {
        setTitle(null)
        setAuthors(null)
        setCategories(null)
    }

    return (
        <div className="flex flex-col gap-2">
            <TitleFilter />
            <div className="flex flex-row gap-2 items-center w-full">
                <AuthorFilter />
                <CategoryFilter />
                <Button onClick={() => reset()} className="w-fit" variant="destructive">
                    reset
                </Button>
            </div>
        </div>
    )
}