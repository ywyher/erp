'use server'

import db from "@/lib/db";
import { appointment, User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getAppointments(userId: User['id']) {
    return await db.select().from(appointment).where(eq(appointment.patientId, userId))
}