'use server'

import db from "@/lib/db"
import { appointment } from "@/lib/db/schema"
import { generateId } from "@/lib/funcs"
import { revalidatePath } from "next/cache"

export async function createAppointment({ doctorId, patientId, receptionistId }: { doctorId: string, patientId: string, receptionistId?: string }) {
    const createdAppointment = await db.insert(appointment).values({
        id: generateId(),
        patientId: patientId,
        doctorId: doctorId,
        receptionistId: receptionistId ? receptionistId : null,
        startTime: new Date(),
        endTime: new Date(),
        status: 'ongoing',
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