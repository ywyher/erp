'use server'

import db from "@/lib/db"
import { faq, Post, post, service } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm";

type TGetPosts = { 
    category?: Post['category'] | 'all';
    limit?: number
}

export async function getPosts({ category = 'all', limit = 6 }: TGetPosts) {

    const conditions = [eq(post.status, 'published')];

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

export async function getService() {
    return await db.select().from(service).where(eq(service.status, 'published'))
}

export async function getFaq() {
    return await db.select().from(faq).where(eq(faq.status, 'published'))
}