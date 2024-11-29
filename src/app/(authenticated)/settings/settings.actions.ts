'use server'

import { TSettingsSchema } from "@/app/(authenticated)/settings/settings.types";
import { checkFieldInUserTable } from "@/lib/db/queries";
import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type UpdateField = {
    value: string | null; // The value of the field
    nullable: boolean;    // Whether the field can be set to null
};

type UpdateData = Record<keyof TSettingsSchema, UpdateField>;

export async function updateSettings(data: { userId: string } & UpdateData) {
    // Initialize the update payload
    const updatePayload = {} as Partial<TSettingsSchema>;

    // Unique field checks
    if (data.username?.value) {
        await checkFieldInUserTable({ field: 'username', value: data.username.value })
    }

    if (data.email?.value) {
        await checkFieldInUserTable({ field: 'email', value: data.email.value })
    }

    if (data.phoneNumber?.value) {
        await checkFieldInUserTable({ field: 'phoneNumber', value: data.phoneNumber.value })
    }

    // Iterate through the fields in the data object
    for (const key in data) {
        if (key === 'userId') continue;
        const field = data[key as keyof TSettingsSchema];

        // Add to updatePayload if value is not null or nullable is true
        if (field.value !== null || field.nullable) {
            // Convert null to undefined to match the type requirement
            updatePayload[key as keyof TSettingsSchema] = field.value;
        }
    }

    // If no fields to update, return early
    if (Object.keys(updatePayload).length === 0) {
        return { error: "No fields to update" };
    }

    console.log(updatePayload)

    // Update the database
    const result = await db.update(user)
        .set(updatePayload)
        .where(eq(user.id, data.userId));

    if (!result) throw new Error("Profile not updated");

    return {
        success: true,
    };
}
