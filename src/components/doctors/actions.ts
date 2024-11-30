'use server'

import db from "@/lib/db";
import { doctor, schedule, user } from "@/lib/db/schema";
import { and, eq, sql, inArray, or, like } from "drizzle-orm";
import { DateRange } from "react-day-picker";

export async function listDoctors({ specialties = null, date = null, name = null }: { specialties: string[] | null, date: DateRange | null, name: string | null }) {
    let query = db.select({
        user: user,
        doctor: doctor,
        schedules: sql`JSON_AGG(schedule)`.as('schedules'),
    }).from(user)
        .innerJoin(doctor, eq(user.id, doctor.userId))
        .leftJoin(schedule, eq(user.id, schedule.userId))
        .where(eq(user.role, 'doctor'))

    // Apply specialty filter if provided
    if (specialties) {
        query = query.where(inArray(doctor.specialty, specialties));
    }

    // Apply date filter if provided
    if (date?.from) {
        const fromDate = new Date(date.from);
        const toDate = date.to ? new Date(date.to) : new Date(fromDate);
        toDate.setHours(23, 59, 59, 999); // Set to end of day

        const daysInRange = getDaysInRange(fromDate, toDate);

        query = query.where(
            inArray(schedule.day, daysInRange)
        );
    }

    // Apply name filter if provided
    if (name) {
        query = query.where(
            or(
                like(user.username, `%${name}%`),
                like(user.name, `%${name}%`)
            )
        );
    }

    query = query.groupBy(user.id, doctor.id);

    const doctors = await query.execute();
    return doctors || [];
}

function getDaysInRange(start: Date, end: Date): string[] {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const result = [];
    const current = new Date(start);

    while (current <= end) {
        result.push(days[current.getDay()]);
        current.setDate(current.getDate() + 1);
    }

    return [...new Set(result)]; // Remove duplicates
}