'use client'

import Post from "@/components/post";
import { getPost, getPostAuthor } from "@/app/(authenticated)/dashboard/(admin)/posts/actions";
import { Post as TPost, User } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function PostPreview() {
    const params = useParams();
    const slug = params.slug as string; // Ensure it's treated as a string

    const { data: postData, isLoading: isPostDataLoading } = useQuery({
        queryKey: ['post-data', slug],
        queryFn: async () => {
            return await getPost({ slug })
        }
    })
    
    const { data: authorData, isLoading: isAuthorDataLoading } = useQuery({
        queryKey: ['author-data', slug],
        queryFn: async () => {
            return await getPostAuthor({ authorId: postData?.authorId || "" })
        },
        enabled: !!postData?.authorId
    })
    
    if(isPostDataLoading || isAuthorDataLoading) return <>Loading...</>

    return (
        <Post 
            post={postData as TPost}
            author={authorData as User}
        />
    )
}