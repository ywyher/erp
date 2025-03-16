"use server";

import { getSession } from "@/lib/auth-client"
import db from "@/lib/db"
import { admin, Post, post, user } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify'
import { deleteFile } from "@/lib/s3";

export async function createPost({ title, content, status, category, thumbnail, tags }: { 
     title: Post['title'],
     content: Post['content'],
     status: Post['status'],
     thumbnail: Post['thumbnail'],
     category: Post['category']
     tags: Post['tags']
    }) {
    try {
        const userData = await getSession({
            fetchOptions: {
                headers: await headers(),
            },
        });
    
        if(!userData.data || !userData.data.user) throw new Error("Couldn't Retrieve User Data...");
        
        // Get the admin record for this user
        const adminRecord = await db.query.admin.findFirst({
            where: eq(admin.userId, userData.data.user.id)
        });
        
        if (!adminRecord) throw new Error("You don't have permission to create posts");
        
        const postId = generateId();
        const authorId = adminRecord.id;

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
    } catch (error: any) {
        return {
          error: error.message || "Couldn't create the post",
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
    } catch (error: any) {
        return {
          error: error.message || "Couldn't updated the post",
          message: null,
        };
      }
}

export async function DeletePost({ id, names }: { id: Post['id'], names: string[] }) {
    await db.delete(post).where(eq(post.id, id));

    // Execute all deleteFile operations in parallel
    await Promise.all(names.map(name => deleteFile(name)));

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
    const [adminData] = await db.select().from(admin)
        .where(eq(admin.id, authorId))

    const [author] = await db.select().from(user)
        .where(eq(user.id, adminData.userId))

        console.log(author)

    return author;
}