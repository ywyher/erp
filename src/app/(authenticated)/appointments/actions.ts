'use server'

import db from "@/lib/db/index";
import { appointment, User } from "@/lib/db/schema";
import { format } from "date-fns";
import { eq } from "drizzle-orm";

export async function getAppointments(userId: User['id'], role: User['role']) {
    const appointments = await db.select().from(appointment).where(eq(appointment.patientId, userId))

    return appointments.map((appointment) => ({
        id: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        status: appointment.status,
        creatorId: appointment.creatorId || null,
        startTime: appointment.startTime, // Keep as Date object
        endTime: appointment.endTime, // Keep as Date object
        createdBy: appointment.createdBy || 'user',
        date: format(appointment.startTime, "EEEE, d MMMM"), // Example format
        role: role
    }));
}