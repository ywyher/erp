'use server'

import { createUser } from "@/app/(authenticated)/dashboard/actions";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import db from "@/lib/db";
import { deleteById } from "@/lib/db/queries";
import { doctor, schedule, user } from "@/lib/db/schema";
import { generateId, transformSchedulesToRecords } from "@/lib/funcs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { updateUser } from "@/app/actions";
import { createDoctorSchema, updateDoctorSchema } from "@/app/(authenticated)/dashboard/(admins)/doctors/types";
import { z } from "zod";

export async function createDoctor({ userData, schedulesData }: { userData: z.infer<typeof createDoctorSchema>, schedulesData: Schedules }) {
    const createdUser = await createUser({ data: userData, role: 'doctor' });

    if (!createdUser || !createdUser.userId) {
        return {
            error: createdUser?.error,
        };
    }

    const doctorId = generateId();

    const createdDoctor = await db.insert(doctor).values({
        id: doctorId,
        specialty: userData.specialty,
        userId: createdUser.userId,
    }).returning({
        userId: doctor.userId
    });

    if (!createdDoctor) {
        await deleteById(createdUser.userId, 'user')
        return {
            error: "Failed to create doctor record.",
        };
    }

    const scheduleRecords = transformSchedulesToRecords(schedulesData, createdUser.userId)

    const insertedSchedules = await db.insert(schedule).values(scheduleRecords);

    if (!insertedSchedules) {
        await deleteById(createdDoctor[0].userId, 'doctor')
        return {
            error: "Failed to create schedule records.",
        };
    }

    revalidatePath("/dashboard/doctors");
    return {
        message: "Doctor created successfully!",
    };
}

export async function updateDoctor(
    {
        data,
        userId
    }:
        {
            data: z.infer<typeof updateDoctorSchema>,
            userId: string
        }
) {
    const updatedUser = await updateUser({ data, userId })

    if (!updatedUser || !updatedUser.userId) {
        return {
            error: updatedUser?.error,
        };
    }

    if (data.specialty) {
        const updatedDoctor = await db.update(doctor).set({
            specialty: data.specialty
        })
    }

    revalidatePath("/dashboard/doctors");
    return {
        message: "Doctor updated successfully!",
    };
}