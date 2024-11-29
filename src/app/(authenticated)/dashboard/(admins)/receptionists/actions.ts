'use server'

import { createUser } from "@/app/(authenticated)/dashboard/actions";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import db from "@/lib/db";
import { deleteById } from "@/lib/db/queries";
import { receptionist, schedule } from "@/lib/db/schema";
import { generateId, transformSchedulesToRecords } from "@/lib/funcs";
import { revalidatePath } from "next/cache";
import { updateUser } from "@/app/actions";
import { z } from "zod";
import { createReceptionistSchema, updateReceptionistSchema } from "@/app/(authenticated)/dashboard/(admins)/receptionists/types";

export async function createReceptionist({ userData, schedulesData }: { userData: z.infer<typeof createReceptionistSchema>, schedulesData: Schedules }) {
    const createdUser = await createUser({ data: userData, role: 'receptionist' });

    if (!createdUser || !createdUser.userId) {
        return {
            error: createdUser?.error,
        };
    }

    const receptionistId = generateId();

    const createdReceptionist = await db.insert(receptionist).values({
        id: receptionistId,
        department: userData.department,
        userId: createdUser.userId,
    }).returning({
        userId: receptionist.userId
    });

    if (!createdReceptionist) {
        await deleteById(createdUser.userId, 'user')
        return {
            error: "Failed to create receptionist record.",
        };
    }

    const scheduleRecords = transformSchedulesToRecords(schedulesData, createdUser.userId)

    const insertedSchedules = await db.insert(schedule).values(scheduleRecords);

    if (!insertedSchedules) {
        await deleteById(createdReceptionist[0].userId, 'receptionist')
        return {
            error: "Failed to create schedule records.",
        };
    }

    revalidatePath("/dashboard/receptionists");
    return {
        message: "Receptionist created successfully!",
    };
}

export async function updateReceptionist(
    {
        data,
        userId
    }:
        {
            data: z.infer<typeof updateReceptionistSchema>,
            userId: string
        }
) {
    const updatedUser = await updateUser({ data, userId })

    if (!updatedUser || !updatedUser.userId) {
        return {
            error: updatedUser?.error,
        };
    }

    if (data.department) {
        await db.update(receptionist).set({
            department: data.department
        })
    }

    revalidatePath("/dashboard/receptionists");
    return {
        message: "Receptionist updated successfully!",
    };
}