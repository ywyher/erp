'use server'

import db from "@/lib/db";
import { doctor, schedule, user } from "@/lib/db/schema";
import { and, eq, sql, inArray, or, like, SQL } from "drizzle-orm";
import { DateRange } from "react-day-picker";

export async function listDoctors({ specialties = null, date = null, name = null }: { specialties: string[] | null, date: DateRange | null, name: string | null }) {
    let conditions = [eq(user.role, 'doctor')];

    if (specialties) {
        conditions.push(inArray(doctor.specialty, specialties));
    }

    if (date?.from) {
        const fromDate = new Date(date.from);
        const toDate = date.to ? new Date(date.to) : new Date(fromDate);
        toDate.setHours(23, 59, 59, 999);

        const daysInRange = getDaysInRange(fromDate, toDate) as ("sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday")[];
        conditions.push(inArray(schedule.day, daysInRange));
    }

    const nameConditions: SQL<unknown>[] = [];

    if (name) {
        nameConditions.push(like(user.username, `%${name}%`));
        nameConditions.push(like(user.name, `%${name}%`));
    }
    
    if (nameConditions.length > 0) {
        conditions.push(or(...nameConditions) as SQL<unknown>); // Ensure it's never undefined
    }
    

    const query = db
        .select({
            user,
            doctor,
            schedules: sql`json_agg(schedule.*)`.as('schedules'),
        })
        .from(user)
        .innerJoin(doctor, eq(user.id, doctor.userId))
        .leftJoin(schedule, eq(user.id, schedule.userId))
        .where(and(...conditions))
        .groupBy(user.id, doctor.id);

    return await query.execute();
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