'use server'

import { serviceSchema } from "@/app/(authenticated)/dashboard/(admin)/services/types"
import { auth } from "@/lib/auth"
import db from "@/lib/db/index"
import { admin, Service, service, User } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { z } from "zod"

export async function getServices() {
    return await db.select().from(service)
}

export const getServiceData = async (serviceId: Service['id']) => {
  const [serviceData] = await db.select().from(service)
    .where(eq(service.id, serviceId))

  return serviceData
}

export async function createService({ data }: { data: z.infer<typeof serviceSchema> }) {
    try {
        const userData = await auth.api.getSession({
            headers: await headers(),
        });

        const user = userData?.user as User
    
        if(!user) throw new Error("Couldn't Retrieve User Data...");
        
        const adminRecord = await db.query.admin.findFirst({
            where: eq(admin.userId, user.id)
        });
        
        if (!adminRecord) throw new Error("You don't have permission to create services");
        
        const serviceId = generateId();
        const creatorId = adminRecord.id;
        
        const [createdService] = await db.insert(service).values({
            id: serviceId,
            title: data.title,
            icon: data.icon,
            status: data.status,
            creatorId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning()

        if(!createdService.id) throw new Error("Couldn't create the service");

        return {
            error: null,
            message: "Service created successfully!"
        }
    } catch (error: unknown) {
        return {
          error: error instanceof Error ? error.message : "Couldn't create the service",
          message: null,
        };
      }
}

export async function updateService({ data, serviceId }: { data: z.infer<typeof serviceSchema>, serviceId: Service['id'] }) {
    try {
        const [updatedService] = await db.update(service).set({
            title: data.title,
            status: data.status,
            icon: data.icon,
            updatedAt: new Date(),
        })
        .where(eq(service.id, serviceId))
        .returning();

        if(!updatedService.id) throw new Error("Couldn't create the service");

        return {
            error: null,
            message: "Service created successfully!"
        }
    } catch (error: unknown) {
        return {
          error: error instanceof Error ? error.message : "Couldn't create the service",
          message: null,
        };
      }
}