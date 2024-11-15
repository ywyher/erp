'use server'

import { TSettingsSchema } from "@/app/(authenticated)/settings/settings.types";
import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function updateSettings(data: { userId: string } & Partial<TSettingsSchema>) {
    if (data.username) {
        const isUsernameExists = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.username, data.username ?? '')
        })

        if (isUsernameExists) {
            return {
                error: 'Username exists!'
            }
        }
    }

    // Construct update payload with only the fields that are present in data
    const updatePayload = {} as Partial<TSettingsSchema>;
    if (data.name) updatePayload.name = data.name;
    if (data.username) updatePayload.username = data.username;
    if (data.bio) updatePayload.bio = data.bio;

    const result = await db.update(user)
        .set({
            ...updatePayload
        })
        .where(eq(user.id, data.userId))

    if (!result) throw new Error('Profile not updated');

    return {
        success: true
    };
} 