'use server'

import { getSession } from "@/lib/auth-client"
import db from "@/lib/db"
import { admin, Service, service } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export async function getServices() {
    return await db.select().from(service)
}

export const getServiceData = async (serviceId: Service['id']) => {
  const [serviceData] = await db.select().from(service)
    .where(eq(service.id, serviceId))

  return serviceData
}

export async function createService({ title, content, status, thumbnail }: { 
     title: Service['title'],
     content: Service['content'],
     status: Service['status'],
     thumbnail: Service['thumbnail']
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
        
        if (!adminRecord) throw new Error("You don't have permission to create services");
        
        const serviceId = generateId();
        const creatorId = adminRecord.id;
        
        const [createdService] = await db.insert(service).values({
            id: serviceId,
            title,
            content,
            thumbnail,
            status,
            creatorId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning({ id: service.id })

        if(!createdService.id) throw new Error("Couldn't create the service");

        return {
            error: null,
            message: "Service created successfully!"
        }
    } catch (error: any) {
        return {
          error: error.message || "Couldn't create the service",
          message: null,
        };
      }
}

export async function updateService({ title, content, status, thumbnail, serviceId }: { 
     title: Service['title'],
     content: Service['content'],
     status: Service['status'],
     thumbnail: Service['thumbnail']
     serviceId: Service['id'] 
    }) {
    try {
        const [updatedService] = await db.update(service).set({
            title,
            content,
            status,
            thumbnail,
            updatedAt: new Date(),
        })
        .where(eq(service.id, serviceId))
        .returning({ id: service.id });

        if(!updatedService.id) throw new Error("Couldn't create the service");

        return {
            error: null,
            message: "Service created successfully!"
        }
    } catch (error: any) {
        return {
          error: error.message || "Couldn't create the service",
          message: null,
        };
      }
}