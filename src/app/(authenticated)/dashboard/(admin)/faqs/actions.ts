'use server'

import { faqSchema } from "@/app/(authenticated)/dashboard/(admin)/faqs/types"
import { getSession } from "@/lib/auth-client"
import db from "@/lib/db"
import { admin, Faq, faq } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { z } from "zod"

export async function getFaqs() {
    return await db.select().from(faq)
}

export const getFaqData = async (faqId: Faq['id']) => {
  const [faqData] = await db.select().from(faq)
    .where(eq(faq.id, faqId))

  return faqData
}

export async function createFaq({ data }: { data: z.infer<typeof faqSchema> }) {
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
        
        if (!adminRecord) throw new Error("You don't have permission to create faqs");
        
        const faqId = generateId();
        const creatorId = adminRecord.id;
        
        const [createdFaq] = await db.insert(faq).values({
            id: faqId,
            question: data.question,
            answer: data.answer,
            status: data.status,
            creatorId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning({ id: faq.id })

        if(!createdFaq.id) throw new Error("Couldn't create the faq");

        return {
            error: null,
            message: "Faq created successfully!"
        }
    } catch (error: unknown) {
        return {
          error: error instanceof Error ? error.message : "Couldn't create the faq",
          message: null,
        };
      }
}

export async function updateFaq({ data, faqId }: { data: z.infer<typeof faqSchema>, faqId: Faq['id'] }) {
    try {
        const [updatedFaq] = await db.update(faq).set({
            question: data.question,
            answer: data.answer,
            status: data.status,
            updatedAt: new Date(),
        })
        .where(eq(faq.id, faqId))
        .returning({ id: faq.id });

        if(!updatedFaq.id) throw new Error("Couldn't create the faq");

        return {
            error: null,
            message: "Faq created successfully!"
        }
    } catch (error: unknown) {
        return {
          error: error instanceof Error ? error.message : "Couldn't create the faq",
          message: null,
        };
      }
}