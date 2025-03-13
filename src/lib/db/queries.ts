"use server";

import { Roles, tableMap } from "@/app/types";
import { auth } from "@/lib/auth";
import pluralize from "pluralize"; // Install with: npm install pluralize
import db from "@/lib/db";
import {
  appointment,
  Doctor,
  doctor,
  news,
  News,
  receptionist,
  Receptionist,
  Schedule,
  schedule,
  Service,
  session,
  settings,
  Tables,
  user,
  User
} from "@/lib/db/schema";
import { deleteFile } from "@/lib/s3";
import {
  and,
  ConsoleLogWriter,
  eq,
  gte,
  inArray,
  like,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { medicalFile } from "./schema/medical-file";
import { getDaysInRange, getFileUrl } from "@/lib/funcs";
import { operationDocumentKey } from "@/app/(authenticated)/dashboard/settings/keys";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { service } from "./schema/service";

export async function getUserProvider(
  userId: string,
): Promise<{ provider: "social" | "credential" }> {
  const result = await db.query.account.findFirst({
    where: (account, { eq }) => eq(account.userId, userId),
    columns: {
      providerId: true,
    },
  });

  if (result?.providerId !== "credential") {
    return { provider: "social" };
  } else {
    return { provider: "credential" };
  }
}

export async function checkFieldAvailability({
  field,
  value,
  dbInstance = db,
}: {
  field: "email" | "username" | "phoneNumber" | "nationalId";
  value: string;
  dbInstance?: typeof db;
}) {
  const doesFieldExists = await dbInstance.query.user.findFirst({
    where: (user, { eq }) => eq(user[field], value),
  });

  return {
    isAvailable: doesFieldExists?.createdAt ? false : true,
    error:
      doesFieldExists?.createdAt &&
      doesFieldExists?.id !== value &&
      `${field} already exists!`,
  };
}

export async function getUserById(userId: string, role: Roles) {
  if (role == "user") {
    const result = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, userId),
    });

    return result as User;
  }
  if (role == "doctor") {
    const result = await db
      .select({
        user: user,
        doctor: doctor,
        schedules: sql`JSON_AGG(schedule)`.as("schedules"),
      })
      .from(user)
      .leftJoin(doctor, eq(user.id, doctor.userId))
      .leftJoin(schedule, eq(user.id, schedule.userId))
      .where(eq(user.id, userId))
      .groupBy(user.id, doctor.id);

    return result[0] as { user: User; doctor: Doctor; schedules: Schedule[] };
  }
  if (role == "receptionist") {
    const result = await db
      .select({
        user: user,
        receptionist: receptionist,
        schedules: sql`JSON_AGG(schedule)`.as("schedules"),
      })
      .from(user)
      .leftJoin(receptionist, eq(user.id, receptionist.userId))
      .leftJoin(schedule, eq(user.id, schedule.userId))
      .where(eq(user.id, userId))
      .groupBy(user.id, receptionist.id);

    return result[0] as {
      user: User;
      receptionist: Receptionist;
      schedules: Schedule[];
    };
  }
}

export async function listUsers(role: Roles, merge: boolean = false) {
  let users;

  if (role === "user") {
    users = await db.query.user.findMany({
      where: (user, { eq }) => eq(user.role, role),
    });
  }

  if (role === "doctor") {
    const result = await db
      .select({
        user: user,
        doctor: doctor,
        schedules: sql`JSON_AGG(schedule)`.as("schedules"),
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

  if (role === "receptionist") {
    const result = await db
      .select({
        user: user,
        receptionist: receptionist,
        schedules: sql`JSON_AGG(schedule)`.as("schedules"),
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

  if (role === "admin") {
    users = await db.query.user.findMany({
      where: (user, { eq }) => eq(user.role, role),
    });
  }

  return users;
}

export async function searchUsers(query: string, role: Roles | "all") {
  const lowerQuery = `%${query.toLowerCase()}%`;

  // Create the base conditions for the query
  const baseConditions = or(
    like(sql`LOWER(${user.name})`, lowerQuery),
    like(sql`LOWER(${user.username})`, lowerQuery),
    like(sql`LOWER(${user.email})`, lowerQuery),
    like(user.nationalId, lowerQuery),
    like(user.phoneNumber, lowerQuery),
  );

  // Add the role condition only if role is not 'all'
  const conditions =
    role === "all" ? baseConditions : and(baseConditions, eq(user.role, role));

  const results = await db.select().from(user).where(conditions).limit(10);

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
    return "both"; // Registered with both email and phone number
  } else if (email) {
    return "email"; // Registered with email
  } else if (phoneNumber) {
    return "phoneNumber"; // Registered with phone number
  } else {
    return "none"; // User has neither email nor phone number (unlikely)
  }
}

export async function getWorkerUserId(
  workerId: string,
  table: "doctor" | "receptionist",
) {
  if (table == "doctor") {
    const [doctorData] = await db
      .select()
      .from(doctor)
      .where(eq(doctor.id, workerId));

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, doctorData.userId));

    return userData.id;
  } else if (table == "receptionist") {
    const [receptionistData] = await db
      .select()
      .from(receptionist)
      .where(eq(receptionist.id, workerId));

    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, receptionistData.userId));

    return userData.id;
  }
}

export const getOperationDocument = async ({
  dbInstance = db,
}: {
  dbInstance?: typeof db;
}) => {
  try {
    const [operationDocument] = await dbInstance
      .select()
      .from(settings)
      .where(eq(settings.key, operationDocumentKey));

    if (!operationDocument.id)
      throw new Error("Couldn't get operation document");

    return {
      name: operationDocument.value,
      error: null,
    };
  } catch (error: any) {
    return {
      name: null,
      error: error.message,
    };
  }
};

export async function getEmployees({
  role,
  date,
}: {
  role: User["role"];
  date?: { from: string; to?: string } | undefined;
}) {
  console.log(date);
  // Format the time as HH:MM for comparison
  const fromDate = new Date(date?.from || "");
  const toDate = date?.to ? new Date(date?.to) : new Date(fromDate);

  /*
      const fromDate = new Date("2025-02-26"); // Feb 26, 2025 at 00:00:00
      const toDate = new Date("2025-02-28");   // Feb 28, 2025 at 00:00:00 (Midnight)
  
      // Without setHours(23, 59, 59, 999), filtering may miss Feb 28 completely
  */
  toDate.setHours(23, 59, 59, 999);

  const daysInRange = getDaysInRange(fromDate, toDate) as (
    | "sunday"
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
  )[];

  if (role === "doctor") {
    const doctors = await db.query.user.findMany({
      where: eq(user.role, "doctor"),
      with: {
        doctor: true,
        schedules: {
          where: and(inArray(schedule.day, daysInRange)),
        },
      },
    });

    // Filter out doctors with no matching schedules
    return doctors
      .filter((doc) => doc.doctor && doc.schedules.length > 0)
      .map((doc) => ({
        user: doc,
        doctor: {
          id: doc.doctor.id,
          specialty: doc.doctor.specialty,
          userId: doc.doctor.userId,
        },
        schedules: doc.schedules,
      }));
  } else if (role === "receptionist") {
    const receptionists = await db.query.user.findMany({
      where: eq(user.role, "receptionist"),
      with: {
        receptionist: true,
        schedules: {
          where: and(inArray(schedule.day, daysInRange)),
        },
      },
    });

    // Filter out receptionists with no matching schedules
    return receptionists
      .filter((rec) => rec.receptionist && rec.schedules.length > 0)
      .map((rec) => ({
        user: rec,
        receptionist: {
          id: rec.receptionist.id,
          department: rec.receptionist.department,
          userId: rec.receptionist.userId,
          createdAt: rec.receptionist.createdAt,
          updatedAt: rec.receptionist.updatedAt,
        },
        schedules: rec.schedules,
      }));
  }

  return [];
}

export async function getQuantityByDay({
  tableNames,
  startDate,
  endDate,
  conditions,
}: {
  tableNames: Tables | Tables[];
  startDate?: Date;
  endDate?: Date;
  conditions?: {
    [tableName in Tables]?: {
      field: string;
      operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "like";
      value: string | number | boolean | string[] | number[];
    }[];
  };
}) {
  // Convert single table name to array for consistent handling
  const tables = Array.isArray(tableNames) ? tableNames : [tableNames];

  // Fetch data for each table
  const allResults = await Promise.all(
    tables.map(async (tableName) => {
      const table = tableMap[tableName];
      if (!table) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      // Create an array to hold SQL condition objects
      const whereClauses = [];

      // Add date range conditions only if provided
      if (startDate) {
        whereClauses.push(
          sql`${table.createdAt} >= ${startDate.toISOString()}`,
        );
      }
      if (endDate) {
        whereClauses.push(sql`${table.createdAt} <= ${endDate.toISOString()}`);
      }

      // Add table-specific conditions if provided
      const tableConditions = conditions?.[tableName] || [];
      tableConditions.forEach((condition) => {
        // Get the field from the table schema
        const field = table[condition.field];
        if (!field) {
          throw new Error(
            `Invalid field name for table ${tableName}: ${condition.field}`,
          );
        }

        // Build the condition based on the operator
        switch (condition.operator) {
          case "eq":
            whereClauses.push(sql`${field} = ${condition.value}`);
            break;
          case "neq":
            whereClauses.push(sql`${field} <> ${condition.value}`);
            break;
          case "gt":
            whereClauses.push(sql`${field} > ${condition.value}`);
            break;
          case "gte":
            whereClauses.push(sql`${field} >= ${condition.value}`);
            break;
          case "lt":
            whereClauses.push(sql`${field} < ${condition.value}`);
            break;
          case "lte":
            whereClauses.push(sql`${field} <= ${condition.value}`);
            break;
          case "in":
            if (Array.isArray(condition.value)) {
              whereClauses.push(sql`${field} IN ${condition.value}`);
            } else {
              throw new Error('Value must be an array for "in" operator');
            }
            break;
          case "like":
            whereClauses.push(sql`${field} LIKE ${condition.value}`);
            break;
          default:
            throw new Error(`Unsupported operator: ${condition.operator}`);
        }
      });

      // Format the result in the shape you need - using PostgreSQL's TO_CHAR function
      const baseQuery = db
        .select({
          date: sql`TO_CHAR(${table.createdAt}, 'YYYY-MM-DD')`.as("date"),
          [pluralize(tableName)]: sql`COUNT(*)`.as(`${pluralize(tableName)}`),
        })
        .from(table);

      // Add WHERE clauses if any exist
      let result;
      if (whereClauses.length > 0) {
        // Combine with AND using drizzle's approach
        result = await baseQuery
          .where(sql.join(whereClauses, sql` AND `))
          .groupBy(sql`TO_CHAR(${table.createdAt}, 'YYYY-MM-DD')`)
          .orderBy(sql`date`);
      } else {
        // No conditions
        result = await baseQuery
          .groupBy(sql`TO_CHAR(${table.createdAt}, 'YYYY-MM-DD')`)
          .orderBy(sql`date`);
      }

      return { tableName, data: result };
    }),
  );

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
    data.forEach((item) => {
      const date = item.date as string; // Type assertion
      if (dateMap.has(date)) {
        // Update existing entry
        dateMap.get(date)[tablePlural] = item[tablePlural];
      } else {
        // Create new entry with default values (0) for all tables
        const newEntry: Record<string, string | number> = { date };
        allResults.forEach((res) => {
          newEntry[pluralize(res.tableName)] = 0;
        });
        newEntry[tablePlural] = item[tablePlural] as number;
        dateMap.set(date, newEntry);
      }
    });
  });

  // Convert map to array and sort by date
  const combinedResults = Array.from(dateMap.values()).sort(
    (a, b) =>
      new Date(a.date as string).getTime() -
      new Date(b.date as string).getTime(),
  );

  return combinedResults;
}

export async function getSchedules(userId: User["id"]) {
  const schedules = await db
    .select()
    .from(schedule)
    .where(eq(schedule.userId, userId));

  return schedules;
}

export async function getEmployeeId(
  userId: User["id"],
  role: "doctor" | "receptionist",
) {
  if (role == "doctor") {
    const [doctorData] = await db
      .select()
      .from(doctor)
      .where(eq(doctor.userId, userId));

    return doctorData.id;
  } else if (role == "receptionist") {
    const [receptionistData] = await db
      .select()
      .from(receptionist)
      .where(eq(receptionist.userId, userId));

    return receptionistData.id;
  }
}


export const listAppointments = async (userId: User["id"], role: User["role"]) => {
  let appointments;

  if (role == "admin") {
    appointments = await db.select().from(appointment);
  }

  if (role == "user") {
    appointments = await db
      .select()
      .from(appointment)
      .where(eq(appointment.patientId, userId));
  }

  if (role == "doctor") {
    const [doctorData] = await db
      .select()
      .from(doctor)
      .where(eq(doctor.userId, userId));

    appointments = await db
      .select()
      .from(appointment)
      .where(eq(appointment.doctorId, doctorData.id));
  }

  if (role == "receptionist") {
    const [receptionistData] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    appointments = await db
      .select()
      .from(appointment)
      .where(eq(appointment.creatorId, receptionistData.id));
  }

  if (!appointments) throw new Error("Couldn't get appointmnets");

  return appointments.map((appointment) => ({
    id: appointment.id,
    date: format(appointment.startTime, "EEEE, d MMMM"), // Example format
    startTime: format(appointment.startTime, "HH:mm"),
    endTime: appointment.endTime
      ? format(appointment.endTime, "HH:mm")
      : "None",
    status: appointment.status,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    createdBy: appointment.createdBy,
    role: role,
  }));
};

export const listServices = async () => {
  const services = await db.select().from(service)

  return services
}

export const queryServiceData = async (serviceId: Service['id']) => {
  const [serviceData] = await db.select().from(service)
    .where(eq(service.id, serviceId))

  return serviceData
}

export const listNews = async () => {
  const listedNews = await db.select().from(news)

  return listedNews
}

export const queryNewsData = async (newId: News['id']) => {
  const [newData] = await db.select().from(news)
    .where(eq(news.id, newId))

  return newData
}