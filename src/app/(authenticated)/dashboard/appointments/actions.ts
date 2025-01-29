'use server'

import { consultationSchema } from "@/app/(authenticated)/dashboard/appointments/types"
import db from "@/lib/db"
import { Appointment, appointment, Doctor, Schedule, User } from "@/lib/db/schema"
import { consultation } from "@/lib/db/schema/consultation"
import { generateId } from "@/lib/funcs"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function createAppointment({
    doctorId,
    patientId,
    createdBy,
    schedule,
    receptionistId,
}: {
    doctorId: string,
    patientId: string,
    createdBy: Appointment['createdBy'],
    schedule?: Schedule;
    receptionistId?: string
}) {

    const createdAppointment = await db.insert(appointment).values({
        id: generateId(),
        patientId: patientId,
        doctorId: doctorId,
        receptionistId: receptionistId ? receptionistId : null,
        startTime: schedule?.startTime ? new Date(schedule.startTime) : new Date(),
        endTime: schedule?.endTime ? new Date(schedule.endTime) : new Date(),
        status: 'ongoing',
        createdBy: createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning()


    if (createdAppointment) {
        revalidatePath('/dashboard/appointments')
        return {
            success: true,
            message: 'Appointment Created Successfuly',
            appointmentId: createdAppointment[0].id,
        }
    }
}