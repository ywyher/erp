"use server";

import { NewsStatus } from "@/app/(authenticated)/dashboard/(admin)/news/types"
import { getSession } from "@/lib/auth-client"
import db from "@/lib/db"
import { admin, News, news } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export async function createNews({ title, content, status, fileName }: { 
     title: string,
     content: string,
     status: NewsStatus,
     fileName: string 
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
        
        if (!adminRecord) throw new Error("You don't have permission to create newss");
        
        const newsId = generateId();
        const authorId = adminRecord.id;
        
        const [createdNews] = await db.insert(news).values({
            id: newsId,
            title,
            content,
            thumbnail: fileName,
            status,
            authorId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning({ id: news.id })

        if(!createdNews.id) throw new Error("Couldn't create the news");

        return {
            error: null,
            message: "News created successfully!"
        }
    } catch (error: any) {
        return {
          error: error.message || "Couldn't create the news",
          message: null,
        };
    }
}

export async function updateNews({ title, content, status, fileName, newsId }: { 
     title: string,
     content: string,
     status: NewsStatus,
     fileName: string,
     newsId: News['id'] 
    }) {
    try {
        const [updatedNews] = await db.update(news).set({
            title,
            content,
            status,
            thumbnail: fileName,
            updatedAt: new Date(),
        })
        .where(eq(news.id, newsId))
        .returning({ id: news.id });

        if(!updatedNews.id) throw new Error("Couldn't create the news");

        return {
            error: null,
            message: "News created successfully!"
        }
    } catch (error: any) {
        return {
          error: error.message || "Couldn't create the news",
          message: null,
        };
      }
}