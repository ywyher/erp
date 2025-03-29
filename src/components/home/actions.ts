'use server'

import db from "@/lib/db"
import { Post, post } from "@/lib/db/schema"
import { and, eq, inArray } from "drizzle-orm";

type TGetPosts = { 
    category?: Post['category'] | 'all';
    limit?: number
}

export async function getPosts({ category = 'all', limit = 6 }: TGetPosts) {

    const conditions = [];

    if (category != 'all') {
        conditions.push(eq(post.category, category));
    }


    const posts = await db.query.post.findMany({
        where: and(...conditions),
        with: {
            user: true
        },
        limit: limit
    })
    
    return {
        posts: posts.map(({ user, ...post }) => ({
          ...post,
          author: user, // Rename "user" to "author"
        })),
    };
}