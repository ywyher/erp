'use server'

import { createUser, updateUserRole } from "@/lib/db/mutations"
import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createUserSchema, updateUserSchema } from "@/app/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateUser } from "@/lib/db/mutations";

export async function createAdmin(data: z.infer<typeof createUserSchema>) {
    const result = await createUser({ data, role: 'admin', verified: true });

    if (result?.error) {
        return {
            error: result.error
        }
    }

    revalidatePath("/dashboard/admins");
    return {
        success: true,
        message: "Admin created successfully"
    }
}

export async function updateAdmin({ data, userId }: { data: z.infer<typeof updateUserSchema>; userId: string }) {
    try {
        const createdUser = await updateUser({ data, userId, role: 'admin' });
    
        if (!createdUser || !createdUser.userId) {
            throw new Error(createdUser.error || "Failed to update admin")
        }
    
        revalidatePath("/dashboard/admins");
        return {
            error: null,
            message: "Admin updated successfully"
        }
    } catch (error: any) {
        return {
            error: error.message,
            message: null,
        }
    }
}