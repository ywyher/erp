"use server";

import db from "@/lib/db/index.local";
import { schedule, User } from "@/lib/db/schema";
import { transformSchedulesToRecords } from "@/lib/funcs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Schedules } from "@/app/(authenticated)/dashboard/types";

export async function updateSchedule({
  schedules,
  userId,
}: {
  schedules: Schedules;
  userId: User["id"];
}) {
  try {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Delete existing schedules for the user
      await tx.delete(schedule).where(eq(schedule.userId, userId));

      // Insert new schedules
      const newSchedules = transformSchedulesToRecords(schedules, userId);

      await tx.insert(schedule).values(newSchedules);

      // Revalidate the path to update the UI
      revalidatePath("/dashboard/schedule");

      return { error: null, message: "Schedule updated successfully" };
    });
  } catch {
    return { error: "Failed", message: null };
  }
}
