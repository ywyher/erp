'use server'

import db from "@/lib/db/index.local"
import { Post, post, user } from "@/lib/db/schema";
import { and, count, eq, inArray, like, or } from "drizzle-orm";

type TGetPosts = {
    authors?: string[] | null,
    title?: string | null,
    categories?: Post['category'][] | null,
    page?: number | null,
    limit?: number | null
  }
  
  export async function getPosts({ 
    authors, 
    title, 
    categories,
    page = 1,
    limit = 10
  }: TGetPosts) {
    const conditions = [];
    
    if (authors && authors.length > 0) {
      conditions.push(inArray(post.authorId, authors));
    }
    
    if (categories && categories.length > 0) {
      conditions.push(inArray(post.category, categories));
    }
    
    if (title) {
      conditions.push(like(post.title, `%${title}%`));
    }
  
    // First get the total count (for pagination)
    const countQuery = db.select({ count: count() }).from(post)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const [countResult] = await countQuery;
    const total = countResult?.count || 0;
  
    // Calculate offset based on page and limit
    const offset = ((page || 1) - 1) * (limit || 10);
    
    // Get the paginated posts
    const posts = await db.query.post.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        user: true, // Fetch the related user (author)
      },
      limit: limit || 10,
      offset: offset,
    });
  
    return {
      posts: posts.map(({ user, ...post }) => ({
        ...post,
        author: user, // Rename "user" to "author"
      })),
      total
    };
  }

export async function getAuthors() {
    const data = await db.select().from(user)
        .where(or(eq(user.role, 'admin'), eq(user.role, 'doctor')));

    return data.map(({ id, name }) => ({
        label: name,
        value: id
    }));
}

export const getPost = async (slug: Post['slug']) => {
    const [postData] = await db.select().from(post)
      .where(eq(post.slug, slug))

    const [authorData] = await db.select().from(user)
        .where(eq(user.id, postData.authorId))
  
    return {
        post: postData,
        author: authorData
    }
}