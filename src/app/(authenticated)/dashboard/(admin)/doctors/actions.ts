"use server";

import { createUser, updateUser } from "@/lib/db/mutations";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import db from "@/lib/db";
import { doctor, schedule, user, User } from "@/lib/db/schema";
import { generateId, transformSchedulesToRecords } from "@/lib/funcs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  createDoctorSchema,
  updateDoctorSchema,
} from "@/app/(authenticated)/dashboard/(admin)/doctors/types";
import { z } from "zod";

export async function getDoctors() {
  const data = await db.query.user.findMany({
    where: eq(user.role, "doctor"),
    with: {
      doctor: true,
      schedules: true
    }
  });

  const doctor = data.map((d) => {
    return {
      ...d,
      specialty: d.doctor.specialty
    }
  });

  console.log(doctor)
  return doctor
}

export async function createDoctor({
  userData,
  schedulesData,
}: {
  userData: z.infer<typeof createDoctorSchema>;
  schedulesData: Schedules;
}) {
  try {
    return await db.transaction(async (tx) => {
      const createdUser = await createUser({
        data: userData,
        role: "doctor",
        verified: true,
        dbInstance: tx,
      });

      if (
        ("error" in createdUser && createdUser.error) ||
        ("error" in createdUser && !createdUser.userId)
      ) {
        throw new Error(createdUser.error || "");
      }

      const doctorId = generateId();
      const createdDoctor = await tx
        .insert(doctor)
        .values({
          id: doctorId,
          specialty: userData.specialty,
          userId: createdUser.userId,
        })
        .returning({
          userId: doctor.userId,
        });

      if (!createdDoctor.length)
        throw new Error("Failed to create doctor record.");

      const scheduleRecords = transformSchedulesToRecords(
        schedulesData,
        createdUser.userId,
      );
      await tx.insert(schedule).values(scheduleRecords);

      if (!scheduleRecords.length)
        throw new Error("Failed to insert schedules");

      revalidatePath("/dashboard/doctors");
      return { error: null, message: "Doctor created successfully!" };
    });
  } catch (error: unknown) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong while creating the user.",
      message: null,
    };
  }
}

export async function updateDoctor({
  data,
  userId,
}: {
  data: z.infer<typeof updateDoctorSchema>;
  userId: User["id"];
}) {
  try {
    return await db.transaction(async (tx) => {
      const updatedUser = await updateUser({
        data,
        userId,
        dbInstance: tx,
        role: "doctor",
      });

      if (!updatedUser || !updatedUser.userId) {
        throw new Error(updatedUser?.error || "Failed to update user.");
      }

      if (data.specialty) {
        await tx
          .update(doctor)
          .set({ specialty: data.specialty })
          .where(eq(doctor.userId, userId));
      }

      revalidatePath("/dashboard/doctors");
      return { message: "Doctor updated successfully!", error: null };
    });
  } catch (error: unknown) {
    return {
      error: error instanceof Error ? error.message : "Failed to update doctor",
      message: null,
    };
  }
}