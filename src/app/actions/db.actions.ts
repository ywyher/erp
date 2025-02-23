'use server'

import { passwordSchema } from "@/app/types";
import db from "@/lib/db";
import { revokeUserSessions } from "@/lib/db/queries";
import { account, User } from "@/lib/db/schema";
import { hashPassword } from "@/lib/password";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function changePassword(data: z.infer<typeof passwordSchema> & { userId: User['id'], revalidatePath?: string }) {
    const hashedPassword = await hashPassword(data.password)

    if (!hashedPassword) {
        return {
            error: "Failed to hash password!"
        }
    }

    const updatedUserAccount = await db.update(account).set({
        password: hashedPassword
    }).where(eq(account.userId, data.userId)).returning()

    if (updatedUserAccount) {
        // const { success } = await revokeUserSessions(data.userId)
        // if (success) {
        //     if (data.revalidatePath) revalidatePath(`/${data.revalidatePath}`);
        // }
        return {
            success: true,
            message: "User password updated successfully"
        }
    }
}