'use server'

import { consultationSchema } from "@/app/(authenticated)/dashboard/appointments/types"
import db from "@/lib/db"
import { Appointment, appointment, Doctor, Schedule, User } from "@/lib/db/schema"
import { consultation } from "@/lib/db/schema/consultation"
import { generateId } from "@/lib/funcs"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function createAppointment({
    doctorId,
    patientId,
    createdBy,
    date,
    status = 'pending',
    creatorId,
}: {
    doctorId: string,
    patientId: string,
    createdBy: Appointment['createdBy'],
    status: Appointment['status'],
    date: Date;
    creatorId: User['id']
}) {
    try {
        const [createdAppointment] = await db.insert(appointment).values({
            id: generateId(),
            patientId: patientId,
            doctorId: doctorId,
            creatorId: creatorId,
            startTime: date,
            status: status,
            createdBy: createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning({ id: appointment.id })
    
        if(!createdAppointment.id) throw new Error("Failed to create appointment")
    
    
        if (createdAppointment) {
            revalidatePath('/dashboard/appointments')
            return {
                error: null,
                message: 'Appointment Created Successfuly',
                appointmentId: createdAppointment.id,
            }
        }
    } catch (error: any) {
        return {
            error: error.message,
            message: null,
            appointmentId: null,
        }
    }
}

export async function updateAppointmentStatus({ appointmentId, status }: { appointmentId: Appointment['id'], status: Appointment['status'] }) {
    const [updatedAppointment] = await db.update(appointment).set({
        status: status
    })
        .where(eq(appointment.id, appointmentId))
        .returning({ id: appointment.id })

    if(!updatedAppointment.id) return {
        error: "Failed to update appointment status!"
    } 

    return {
        message: `Appointment Status Updated To ${status}`,
        error: null
    }
}

export async function updateAppointmentEndTime({ appointmentId, date }: { appointmentId: Appointment['id'] ,date: Date }) {
    const [updatedAppointment] = await db.update(appointment).set({
        endTime: date
    }).returning()

    if(!updatedAppointment.id) return {
        error: "Couldn't update the end time!"
    }

    return {
        appointmentId: updatedAppointment.id,
        message: 'End time updated!!',
        error: null,
    }
}