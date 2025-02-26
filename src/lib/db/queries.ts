'use server'

import { Roles, tableMap } from "@/app/types";
import { auth } from "@/lib/auth";
import pluralize from "pluralize"; // Install with: npm install pluralize
import { signIn, User } from "@/lib/auth-client";
import db from "@/lib/db";
import { account, appointment, dayEnum, Doctor, doctor, receptionist, Receptionist, Schedule, schedule, session, settings, Tables, user } from "@/lib/db/schema";
import { deleteFile } from "@/lib/s3";
import { and, ConsoleLogWriter, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { medicalFile } from "./schema/medical-file";
import { getDaysInRange, getFileUrl } from "@/lib/funcs";
import { operationDocumentKey } from "@/app/(authenticated)/dashboard/settings/keys";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

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

export async function checkFieldAvailability({ field, value, dbInstance = db }: { 
    field: 'email' | 'username' | 'phoneNumber' | 'nationalId',
    value: string,
    dbInstance?: typeof db
}) {
    const doesFieldExists = await dbInstance.query.user.findFirst({
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

        return result[0] as { user: User, receptionist: Receptionist, schedules: Schedule[] };
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

export const getOperationDocument = async ({dbInstance = db}: { dbInstance: typeof db }) => { 
    try {
        const [operationDocument] = await dbInstance.select().from(settings)
            .where(eq(settings.key, operationDocumentKey))

            
        if(!operationDocument.id) throw new Error("Couldn't get operation document");
    
        return { 
            name: operationDocument.value,
            error: null
        };
    } catch (error: any) {
        return {
            name: null,
            error: error.message,
        }
    }
}

export async function getEmployees({ role, date }: { role: User["role"], date?: { from: string; to?: string } | undefined }) {
    console.log(date)
  // Format the time as HH:MM for comparison
  const fromDate = new Date(date?.from || "");
  const toDate = date?.to ? new Date(date?.to) : new Date(fromDate);

  /*
      const fromDate = new Date("2025-02-26"); // Feb 26, 2025 at 00:00:00
      const toDate = new Date("2025-02-28");   // Feb 28, 2025 at 00:00:00 (Midnight)
  
      // Without setHours(23, 59, 59, 999), filtering may miss Feb 28 completely
  */
  toDate.setHours(23, 59, 59, 999);

  const daysInRange = getDaysInRange(fromDate, toDate) as ("sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday")[];

  if (role === 'doctor') {
    const doctors = await db.query.user.findMany({
        where: eq(user.role, 'doctor'),
        with: {
            doctor: true,
            schedules: {
                where: and(
                    inArray(schedule.day, daysInRange),
                ),
            },
        },
    });
      
    // Filter out doctors with no matching schedules
    return doctors
      .filter(doc => doc.doctor && doc.schedules.length > 0)
      .map(doc => ({
        user: doc,
        doctor: {
          id: doc.doctor.id,
          specialty: doc.doctor.specialty,
          userId: doc.doctor.userId
        },
        schedules: doc.schedules
      }));
  } else if (role === 'receptionist') {
    const receptionists = await db.query.user.findMany({
        where: eq(user.role, 'receptionist'),
        with: {
            receptionist: true,
            schedules: {
                where: and(
                    inArray(schedule.day, daysInRange),
                ),
            },
        },
    });
      
    // Filter out receptionists with no matching schedules
    return receptionists
      .filter(rec => rec.receptionist && rec.schedules.length > 0)
      .map(rec => ({
        user: rec,
        receptionist: {
          id: rec.receptionist.id,
          department: rec.receptionist.department,
          userId: rec.receptionist.userId,
          createdAt: rec.receptionist.createdAt,
          updatedAt: rec.receptionist.updatedAt
        },
        schedules: rec.schedules
      }));
  }
  
  return [];
}

export async function getQuantityByDay({
    tableNames,
    condition,
    startDate,
    endDate,
  }: {
    tableNames: Tables | Tables[],
    condition?: string,
    startDate?: Date,
    endDate?: Date
  }) {
    // Convert single table name to array for consistent handling
    const tables = Array.isArray(tableNames) ? tableNames : [tableNames];
    
    // Fetch data for each table
    const allResults = await Promise.all(tables.map(async (tableName) => {
      const table = tableMap[tableName];
      if (!table) {
        throw new Error(`Invalid table name: ${tableName}`);
      }
      
      // Build the WHERE clause dynamically
      let whereConditions: string[] = [];
      
      // Add date range conditions only if provided
      if (startDate) {
        whereConditions.push(`${table.createdAt} >= ${sql`${startDate.toISOString()}`}`);
      }
      if (endDate) {
        whereConditions.push(`${table.createdAt} <= ${sql`${endDate.toISOString()}`}`);
      }
      
      // Add any additional conditions if provided
      if (condition) {
        whereConditions.push(condition);
      }
      
      // Combine all conditions with AND
      const whereClause = whereConditions.length > 0
        ? sql`WHERE ${sql.raw(whereConditions.join(' AND '))}`
        : undefined;
      
      // Format the result in the shape you need - using PostgreSQL's TO_CHAR function
      const result = await db
        .select({
          date: sql`TO_CHAR(${table.createdAt}, 'YYYY-MM-DD')`.as('date'),
          [pluralize(tableName)]: sql`COUNT(*)`.as(`${pluralize(tableName)}`)
        })
        .from(table)
        .where(whereClause)
        .groupBy(sql`TO_CHAR(${table.createdAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`date`);
        
      return { tableName, data: result };
    }));
    
    // If only one table was queried, return its data directly
    if (allResults.length === 1) {
      return allResults[0].data;
    }
    
    // Otherwise, merge all the data by date
    const dateMap = new Map();
    
    // Process each table's results
    allResults.forEach(({ tableName, data }) => {
      const tablePlural = pluralize(tableName);
      
      // First, get all unique dates from this table
      data.forEach(item => {
        const date = item.date as string; // Type assertion
        if (dateMap.has(date)) {
          // Update existing entry
          dateMap.get(date)[tablePlural] = item[tablePlural];
        } else {
          // Create new entry with default values (0) for all tables
          const newEntry: Record<string, string> = { date };
          
          allResults.forEach(res => {
            newEntry[pluralize(res.tableName)] = "0";
          });
          newEntry[tablePlural] = item[tablePlural] as string;
          dateMap.set(date, newEntry);
        }
      });
    });
    
    // Convert map to array and sort by date
    const combinedResults = Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return combinedResults;
}