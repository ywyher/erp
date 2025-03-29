"use client"

import { Badge } from "@/components/ui/badge";
import { Post, User } from "@/lib/db/schema";
import { getFileUrl } from "@/lib/funcs";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function PostCard({ post }: { post: Post & { author: User } }) {
    const router = useRouter();

    // Memoize content extraction to avoid recalculation on re-renders
    const content = useMemo(() => {
        const contentItem = (post.content as any[]).find(
            (item) => item.type === "p" && item.children?.[0]?.text?.trim()
        );
        return contentItem?.children[0]?.text || "";
    }, [post.content]);

    // Memoize truncated content
    const truncatedContent = useMemo(() => {
        return content.length >= 100 ? content.slice(0, 100) + "..." : content;
    }, [content]);

    // Memoize formatted date
    const formattedDate = useMemo(() => {
        return format(post.createdAt, "MMM d, yyyy");
    }, [post.createdAt]);

    // Navigate function
    const handleClick = () => {
        router.push(`/posts/${post.slug}`);
    };

    return (
        <div
            className="
                flex flex-col justify-between w-full
                rounded-lg overflow-hidden shadow-lg bg-[#f9f9f9] dark:bg-[#121212] p-4
                border border-gray-300 dark:border-gray-700
                min-w-[350px] max-w-[320px] min-h-[470px]
                transition-transform hover:scale-105 hover:shadow-xl cursor-pointer
            "
            onClick={handleClick}
        >
            {/* Thumbnail with priority loading for visible cards */}
            <div className="w-full h-48 relative rounded-md overflow-hidden">
                <Image 
                    src={getFileUrl(post.thumbnail)} 
                    alt={post.title} 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-md"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 mt-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                    {post.title}
                </h2>

                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {truncatedContent}
                </p>
            </div>

            {/* Author & Date at Bottom */}
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Image 
                        src={getFileUrl(post.author.image)} 
                        alt={post.author.name} 
                        width={32} 
                        height={32} 
                        className="rounded-full"
                        loading="lazy"
                    />
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                            {post.author.name}
                        </span>
                        <span>•</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formattedDate}
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className="w-fit">{post.category}</Badge>
            </div>
        </div>
    );
}