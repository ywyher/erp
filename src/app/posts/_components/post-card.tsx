"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Post, User } from "@/lib/db/schema";
import { getFileUrl } from "@/lib/funcs";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PostCard({ post }: { post: Post & { author: User } }) {
    const router = useRouter();

    // getting the first valid pharagraph
    const content = (post.content as any[]).find(
        (item) => item.type === "p" && item.children?.[0]?.text?.trim()
    )?.children[0].text || "";

    return (
        <div
            className="
                flex flex-col justify-between w-full
                rounded-lg overflow-hidden shadow-lg bg-[#f9f9f9] dark:bg-[#121212] p-4
                border border-gray-300 dark:border-gray-700
                min-w-[350px] max-w-[320px] min-h-[470px]
                transition-transform hover:scale-105 hover:shadow-xl cursor-pointer
            "
            onClick={() => router.push(`/posts/${post.slug}`)}
        >
            {/* Thumbnail */}
            <div className="w-full h-48 relative rounded-md overflow-hidden">
                <Image 
                    src={getFileUrl(post.thumbnail)} 
                    alt={post.title} 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-md"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 mt-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                    {post.title}
                </h2>

                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {content.length >= 100
                        ? content.slice(0, 100) + "..." 
                        : content}
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
                    />
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                            {post.author.name}
                        </span>
                        <span>•</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(post.createdAt, "MMM d, yyyy")}
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className="w-fit">{post.category}</Badge>
            </div>
        </div>
    );
}