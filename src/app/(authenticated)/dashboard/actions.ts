'use server'

import { checkFieldInUserTable } from "@/lib/db/queries";
import db from "@/lib/db";
import { account, schedule, user } from "@/lib/db/schema";
import { generateFakeField, generateId, transformSchedulesToRecords } from "@/lib/funcs";
import { hashPassword } from "@/lib/password";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createUserSchema, Schedules } from "@/app/(authenticated)/dashboard/types";
import { z } from "zod";
import { Roles } from "@/app/types";

export async function createUser({ data, role }: { data: z.infer<typeof createUserSchema>, role: Roles }) {
    const createPayload: Partial<z.infer<typeof createUserSchema>> = {}

    const { error: usernameError } = await checkFieldInUserTable({ field: 'username', value: data.username })
    if (usernameError) {
        return {
            error: usernameError
        }
    }

    const { error: nationalIdError } = await checkFieldInUserTable({ field: 'nationalId', value: data.nationalId })
    if (nationalIdError) {
        return {
            error: nationalIdError
        }
    }

    if (data.email) {
        const { error } = await checkFieldInUserTable({ field: 'email', value: data.email })
        if (error) {
            return {
                error: error
            }
        } else {
            createPayload.email = data.email
        }
    } else {
        createPayload.email = generateFakeField("email", data.phoneNumber)
    }

    if (data.phoneNumber) {
        const { error } = await checkFieldInUserTable({ field: 'phoneNumber', value: data.phoneNumber })
        if (error) {
            return {
                error: error
            }
        } else {
            createPayload.phoneNumber = data.phoneNumber
        }
    }

    const userId = generateId()
    const accountId = generateId()

    const createdUser = await db.insert(user).values({
        id: userId,
        name: data.name,
        username: data.username,
        ...createPayload,
        nationalId: data.nationalId,
        role: role,
        onBoarding: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning({
        id: user.id
    })

    const createdUserAccount = await db.insert(account).values({
        id: accountId,
        accountId: userId,
        providerId: 'credential',
        userId: userId,
        accessToken: '',
        refreshToken: '',
        idToken: '',
        password: await hashPassword(data.password),
        createdAt: new Date(),
        updatedAt: new Date(),
    })

    if (createdUser && createdUserAccount) {
        return {
            success: true,
            message: 'User created successfully!',
            userId: createdUser[0].id,
        }
    }
}

export async function updateSchedule({ schedules, userId }: { schedules: Schedules; userId: string }) {
    try {
        // Start a transaction
        return await db.transaction(async (tx) => {
            // Delete existing schedules for the user
            await tx.delete(schedule).where(eq(schedule.userId, userId));

            // Insert new schedules
            const newSchedules = transformSchedulesToRecords(schedules, userId)

            await tx.insert(schedule).values(newSchedules);

            // Revalidate the path to update the UI
            revalidatePath('/dashboard/schedule');

            return { success: true, message: 'Schedule updated successfully' };
        });
    } catch (error) {
        console.error('Error updating schedule:', error);
        return { success: false, message: 'Failed to update schedule' };
    }
}

