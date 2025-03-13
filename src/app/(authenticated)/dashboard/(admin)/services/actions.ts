'use server'

import { ServiceStatus, servicSchema } from "@/app/(authenticated)/dashboard/(admin)/services/types"
import { getSession } from "@/lib/auth-client"
import db from "@/lib/db"
import { admin, Service, service } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

export async function createService({ title, content, status, fileName }: { 
     title: string,
     content: string,
     status: ServiceStatus,
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
        
        if (!adminRecord) throw new Error("You don't have permission to create services");
        
        const serviceId = generateId();
        const creatorId = adminRecord.id;
        
        const [createdService] = await db.insert(service).values({
            id: serviceId,
            title,
            content,
            thumbnail: fileName,
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

export async function updateService({ title, content, status, fileName, serviceId }: { 
     title: string,
     content: string,
     status: ServiceStatus,
     fileName: string,
     serviceId: Service['id'] 
    }) {
    try {
        const [updatedService] = await db.update(service).set({
            title,
            content,
            status,
            thumbnail: fileName,
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