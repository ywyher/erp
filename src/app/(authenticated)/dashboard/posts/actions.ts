"use server";

import { getSession } from "@/lib/auth-client"
import db from "@/lib/db/index.local"
import { Post, post, User, user } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify'
import { deleteFile } from "@/lib/s3";
import { revalidatePath } from "next/cache";
import { PostContentItem } from "@/app/(authenticated)/dashboard/posts/types";

export const getPosts = async ({ id, role }: { id: User['id'], role: User['role'] }) => {
    let posts;

    if(role == 'admin') {
        posts = await db.select().from(post)
    }
    if(role == 'doctor') {
        posts = await db.select().from(post)
            .where(eq(post.authorId, id))
    }
  
    return posts
}
  
export const getPostData = async (slug: Post['slug']) => {
    const [postData] = await db.select().from(post)
      .where(eq(post.slug, slug))
  
    return postData
}

export async function createPost({ title, content, status, category, thumbnail, tags }: { 
     title: Post['title'],
     content: Post['content'],
     status: Post['status'],
     thumbnail: Post['thumbnail'],
     category: Post['category']
     tags: Post['tags']
    }) {
    try {
        const { data } = await getSession({
            fetchOptions: {
                headers: await headers(),
            },
        });
    
        if(!data || !data.user) throw new Error("Couldn't Retrieve User Data...");
        
        const postId = generateId();
        const authorId = data.user.id;

        const slug = slugify(`${title}-${uuidv4().split('-')[0]}`, {
            replacement: '-',
            strict: true,
            lower: true,
        });
        
        const [createdPost] = await db.insert(post).values({
            id: postId,
            title,
            slug,
            content,
            thumbnail,
            status,
            tags,
            category,
            authorId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning({ id: post.id })

        if(!createdPost.id) throw new Error("Couldn't create the post");

        return {
            error: null,
            message: "Post created successfully!"
        }
    } catch (error: unknown) {
        return {
          error: error instanceof Error ? error.message : "Couldn't create the post",
          message: null,
        };
    }
}

export async function updatePost({ title, content, status, category, thumbnail, tags, slug }: { 
      title: Post['title'],
      content: Post['content'],
      status: Post['status'],
      thumbnail: Post['thumbnail']
      category: Post['category']
      tags: Post['tags']
      slug: Post['slug']
    }) {
    try {
        const newSlug = slugify(`${title}-${uuidv4().split('-')[0]}`, {
            replacement: '-',
            strict: true,
            lower: true,
        });

        const [updatedPost] = await db.update(post).set({
            title,
            content,
            slug: newSlug,
            status,
            tags,
            category,
            thumbnail,
            updatedAt: new Date(),
        })
        .where(eq(post.slug, slug))
        .returning({ id: post.id });

        if(!updatedPost.id) throw new Error("Couldn't create the post");

        return {
            error: null,
            message: "Post updated successfully!"
        }
    } catch (error: unknown) {
        return {
          error: error instanceof Error ? error.message : "Couldn't update the post",
          message: null,
        };
      }
}

export async function deletePost({ id }: { id: Post['id'] }) {
    const [postData] = await db.select().from(post)
        .where(eq(post.id, id))

    // Assuming you want the first post's content
    const editorFileNames = Array.from(
        new Set(
        (postData.content as PostContentItem[]).filter(con => 
            con.type === 'img' || 
            con.type === 'video' || 
            con.type === 'file' || 
            con.type === 'audio'
        ).map(con => con.name)
        )
    ) as string[];

    const names = [...editorFileNames, postData.thumbnail]

    await db.delete(post).where(eq(post.id, id));

    // Execute all deleteFile operations in parallel
    await Promise.all(names.map(name => deleteFile(name)));

    revalidatePath('/dashboard/posts')
    return {
        message: "Post deleted!",
        error: null,
    };
}

export async function getPost({ slug }: { slug: Post['slug'] }) {
    const [postData] = await db.select().from(post)
        .where(eq(post.slug, slug))

    return postData;
}

export async function getPostAuthor({ authorId }: { authorId: Post['authorId'] }) {
    const [authorData] = await db.select().from(user)
        .where(eq(user.id, authorId))

    const [author] = await db.select().from(user)
        .where(eq(user.id, authorData.id))

        console.log(author)

    return author;
}