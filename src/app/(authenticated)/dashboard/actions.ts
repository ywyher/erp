'use server'

import { checkFieldAvailability } from "@/lib/db/queries";
import db from "@/lib/db";
import { account, schedule, user } from "@/lib/db/schema";
import { generateFakeField, generateId, transformSchedulesToRecords } from "@/lib/funcs";
import { hashPassword } from "@/lib/password";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createUserSchema, Schedules } from "@/app/(authenticated)/dashboard/types";
import { z } from "zod";
import { Roles } from "@/app/types";

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

