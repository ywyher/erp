'use server'

import { Roles } from "@/app/types";
import { auth } from "@/lib/auth";
import { signIn, User } from "@/lib/auth-client";
import db from "@/lib/db";
import { account, appointment, Doctor, doctor, receptionist, Recseptionist, Schedule, schedule, session, settings, Tables, user } from "@/lib/db/schema";
import { deleteFile } from "@/lib/s3";
import { and, ConsoleLogWriter, eq, like, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { medicalFile } from "./schema/medical-file";
import { getFileUrl } from "@/lib/funcs";

export async function getUserProvider(userId: string): Promise<{ provider: 'social' | 'credential' }> {
    const result = await db.query.account.findFirst({
        where: (account, { eq }) => eq(account.userId, userId),
        columns: {
            providerId: true
        }
    });

    if (result?.providerId !== 'credential') {
        return { provider: 'social' };
    } else {
        return { provider: 'credential' };
    }
}

export async function checkFieldAvailability({ field, value }: { field: 'email' | 'username' | 'phoneNumber' | 'nationalId', value: string }) {
    const doesFieldExists = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user[field], value)
    });

    return {
        isAvailable: doesFieldExists?.createdAt ? false : true,
        error: doesFieldExists?.createdAt && doesFieldExists?.id !== value && `${field} already exists!`,
    };
}

export async function getUserById(userId: string, role: Roles) {
    if (role == 'user') {
        const result = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.id, userId)
        })

        return result as User;
    }
    if (role == 'doctor') {
        const result = await db
            .select({
                user: user,
                doctor: doctor,
                schedules: sql`JSON_AGG(schedule)`.as('schedules'),
            })
            .from(user)
            .leftJoin(doctor, eq(user.id, doctor.userId))
            .leftJoin(schedule, eq(user.id, schedule.userId))
            .where(eq(user.id, userId))
            .groupBy(user.id, doctor.id);

        return result[0] as { user: User, doctor: Doctor, schedules: Schedule[] };
    }
    if (role == 'receptionist') {
        const result = await db
            .select({
                user: user,
                receptionist: receptionist,
                schedules: sql`JSON_AGG(schedule)`.as('schedules'),
            })
            .from(user)
            .leftJoin(receptionist, eq(user.id, receptionist.userId))
            .leftJoin(schedule, eq(user.id, schedule.userId))
            .where(eq(user.id, userId))
            .groupBy(user.id, receptionist.id);

        return result[0] as { user: User, receptionist: Recseptionist, schedules: Schedule[] };
    }

}

export async function revokeUserSessions(userId: string) {
    await db.delete(session).where(eq(session.userId, userId))

    return {
        success: true,
        message: 'User sessions revoked!'
    }
}

export async function listUsers(role: Roles, merge: boolean = false) {
    let users;

    if (role === 'user') {
        users = await db.query.user.findMany({
            where: (user, { eq }) => eq(user.role, role),
        });
    }

    if (role === 'doctor') {
        const result = await db
            .select({
                user: user,
                doctor: doctor,
                schedules: sql`JSON_AGG(schedule)`.as('schedules'),
            })
            .from(user)
            .leftJoin(doctor, eq(user.id, doctor.userId))
            .leftJoin(schedule, eq(user.id, schedule.userId))
            .where(eq(user.role, role))
            .groupBy(user.id, doctor.id);

        if (merge) {
            users = result.map(({ user, doctor, schedules }) => ({
                ...user,
                doctorId: doctor?.id || null,
                specialty: doctor?.specialty || null,
                schedules: schedules || null,
            }));
        } else {
            // Keep separate user and doctor objects
            users = result.map(({ user, doctor, schedules }) => ({
                user,
                doctor,
                schedules,
            }));
        }
    }

    if (role === 'receptionist') {
        const result = await db
            .select({
                user: user,
                receptionist: receptionist,
                schedules: sql`JSON_AGG(schedule)`.as('schedules'),
            })
            .from(user)
            .leftJoin(receptionist, eq(user.id, receptionist.userId))
            .leftJoin(schedule, eq(user.id, schedule.userId))
            .where(eq(user.role, role))
            .groupBy(user.id, receptionist.id);

        if (merge) {
            users = result.map(({ user, receptionist, schedules }) => ({
                ...user,
                receptionistId: receptionist?.id || null,
                department: receptionist?.department || null,
                schedules: schedules || null,
            }));
        } else {
            // Keep separate user and receptionist objects
            users = result.map(({ user, receptionist, schedules }) => ({
                user,
                receptionist,
                schedules,
            }));
        }
    }

    if (role === 'admin') {
        users = await db.query.user.findMany({
            where: (user, { eq }) => eq(user.role, role),
        });
    }


    return users;
}

export async function searchUsers(query: string, role: Roles | 'all') {
    const lowerQuery = `%${query.toLowerCase()}%`;

    // Create the base conditions for the query
    const baseConditions = or(
        like(sql`LOWER(${user.name})`, lowerQuery),
        like(sql`LOWER(${user.username})`, lowerQuery),
        like(sql`LOWER(${user.email})`, lowerQuery),
        like(user.nationalId, lowerQuery),
        like(user.phoneNumber, lowerQuery)
    );

    // Add the role condition only if role is not 'all'
    const conditions = role === 'all' ? baseConditions : and(baseConditions, eq(user.role, role));

    const results = await db
        .select()
        .from(user)
        .where(conditions)
        .limit(10);

    return results;
}

export async function getUserRegistrationType(userId: string) {
    // Query the database for the user by ID
    const userFromDb = await db
        .select({
            email: user.email,
            phoneNumber: user.phoneNumber,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1)
        .then((res) => res[0]);

    if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
    }

    // Determine registration type based on email and phoneNumber
    const { email, phoneNumber } = userFromDb;

    if (email && phoneNumber) {
        return 'both'; // Registered with both email and phone number
    } else if (email) {
        return 'email'; // Registered with email
    } else if (phoneNumber) {
        return 'phoneNumber'; // Registered with phone number
    } else {
        return 'none'; // User has neither email nor phone number (unlikely)
    }
}

export async function getWorkerUserId(workerId: string, table: 'doctor' | 'receptionist') {
    if (table == 'doctor') {
        const [doctorData] = await db.select().from(doctor)
            .where(eq(doctor.id, workerId))

        const [userData] = await db.select().from(user)
            .where(eq(user.id, doctorData.userId))

        return userData.id;
    } else if (table == 'receptionist') {
        const [receptionistData] = await db.select().from(receptionist)
            .where(eq(receptionist.id, workerId))

        const [userData] = await db.select().from(user)
            .where(eq(user.id, receptionistData.userId))

        return userData.id;
    }
}

export const getOperationDocument = async () => { 
    const [operationDocument] = await db.select().from(settings)
    .where(eq(settings.key, 'operation-document-url'))

    return operationDocument?.value;
}