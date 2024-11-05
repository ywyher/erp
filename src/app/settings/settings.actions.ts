'use server'

import { TSettingsSchema } from "@/app/settings/settings.types";
import { updateUser } from "@/lib/auth-client";
import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from 'next/headers';

export async function updateSettings(data: { userId: string } & Partial<TSettingsSchema>) {
    const requestHeaders = await headers();

    // Check if the username is changed and exists in the database

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

    console.log(result)

    if (!result) throw new Error('Profile not updated');

    return {
        success: result
    };
} 