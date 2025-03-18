"use server";

import { createUser, updateUserRole } from "@/lib/db/mutations";
import db from "@/lib/db";
import { admin, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createUserSchema, updateUserSchema } from "@/app/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateUser } from "@/lib/db/mutations";
import { generateId } from "@/lib/funcs";

export async function createAdmin(data: z.infer<typeof createUserSchema>) {
    try {
      return await db.transaction(async (tx) => {
        const createdUser = await createUser({ data, role: "admin", verified: true, dbInstance: tx });

        if (
          ("error" in createdUser && createdUser.error) ||
          ("error" in createdUser && !createdUser.userId)
        ) {
          throw new Error(createdUser.error);
        }
  
        const adminId = generateId();
        const createdAdmin = await tx
          .insert(admin)
          .values({
            id: adminId,
            userId: createdUser.userId,
          })
          .returning({
            userId: admin.userId,
          });
  
        if (!createdAdmin.length)
          throw new Error("Failed to create admin record.");
  
        revalidatePath("/dashboard/admins");
        return { error: null, message: "Admin created successfully!" };
      });
    } catch (error: any) {
      return {
        error: error.message || "Something went wrong while creating the user.",
        message: null,
      };
    }
}

export async function updateAdmin({
  data,
  userId,
}: {
  data: z.infer<typeof updateUserSchema>;
  userId: string;
}) {
    try {
      return await db.transaction(async (tx) => {
        const updatedUser = await updateUser({
          data,
          userId,
          dbInstance: tx,
          role: "admin",
        });
  
        if (!updatedUser || !updatedUser.userId) {
          throw new Error(updatedUser?.error || "Failed to update user.");
        }
  
        revalidatePath("/dashboard/admins");
        return { message: "Admin updated successfully!", error: null };
      });
    } catch (error: any) {
      return {
        error: error.message || "Failed to update admin",
        message: null,
      };
    }
}
