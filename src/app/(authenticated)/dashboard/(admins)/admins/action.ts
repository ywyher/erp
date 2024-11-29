'use server'

import { createUser } from "@/app/(authenticated)/dashboard/actions";
import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateUser } from "@/app/actions";
import { userSchema } from "@/app/types";
import { createUserSchema } from "@/app/(authenticated)/dashboard/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function createAdmin(data: z.infer<typeof createUserSchema>) {
    const result = await createUser({ data, role: 'admin' });

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

export async function updateAdmin({ data, userId }: { data: z.infer<typeof userSchema>; userId: string }) {
    const createdUser = await updateUser({ data, userId });

    if (!createdUser || !createdUser.userId) {
        return {
            error: createdUser?.error
        }
    }

    const updatedUserRole = await db
        .update(user)
        .set({
            role: "doctor",
        })
        .where(eq(user.id, createdUser.userId));

    if (!updatedUserRole) {
        return {
            error: "Error while updating user role.",
        };
    }

    revalidatePath("/dashboard/admins");
    return {
        success: true,
        message: "Admin updated successfully"
    }
}