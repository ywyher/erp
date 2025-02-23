'use server'

import { z } from "zod"
import { checkFieldAvailability } from "./queries"
import { updateUserSchema } from "@/app/types"
import db from "."
import { account, appointment, doctor, medicalFile, schedule, session, User, user } from "./schema"
import { eq } from "drizzle-orm"
import { createUserSchema } from "@/app/types"
import { generateFakeField, generateId } from "../funcs"
import { hashPassword } from "../password"
import { deleteFile } from "@/lib/s3"
import { revalidatePath } from "next/cache"

export async function createUser({ data, role, dbInstance = db }: { 
    data: z.infer<typeof createUserSchema>,
    role: User['role'],
    dbInstance?: typeof db;
}) {
    const createPayload: Partial<z.infer<typeof createUserSchema>> = {};

    // Run availability checks BEFORE starting the transaction
    const { error: usernameError } = await checkFieldAvailability({ field: 'username', value: data.username, dbInstance });
    if (usernameError) return { error: usernameError };

    const { error: nationalIdError } = await checkFieldAvailability({ field: 'nationalId', value: data.nationalId, dbInstance });
    if (nationalIdError) return { error: nationalIdError };

    if (data.email) {
        const { error } = await checkFieldAvailability({ field: 'email', value: data.email, dbInstance });
        if (error) return { error };
        createPayload.email = data.email;
    } else {
        createPayload.email = generateFakeField("email", data.phoneNumber);
    }

    if (data.phoneNumber) {
        const { error } = await checkFieldAvailability({ field: 'phoneNumber', value: data.phoneNumber, dbInstance });
        if (error) return { error };
        createPayload.phoneNumber = data.phoneNumber;
    }

    // Start transaction only if checks pass
    try {
        return await dbInstance.transaction(async (tx) => {
            const userId = generateId();
            const accountId = generateId();

            const createdUser = await tx.insert(user).values({
                id: userId,
                name: data.name,
                username: data.username,
                ...createPayload,
                nationalId: data.nationalId,
                role: role,
                onBoarding: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning({ id: user.id });

            if (!createdUser || !createdUser[0]?.id) {
                throw new Error("Failed to create user.");
            }

            const createdUserAccount = await tx.insert(account).values({
                id: accountId,
                accountId: userId,
                providerId: 'credential',
                userId: userId,
                accessToken: '',
                refreshToken: '',
                idToken: '',
                password: await hashPassword(data.password),
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            if (!createdUserAccount) {
                throw new Error("Failed to create user account.");
            }

            return {
                success: true,
                message: 'User created successfully!',
                userId: createdUser[0].id,
                error: null
            };
        });
    } catch (error: any) {
        return {
            error: error.message || "Something went wrong while creating the user.",
            message: null,
            userId: null
        };
    }
}

export async function updateUser({ data, userId, dbInstance = db, role }: { 
    data: z.infer<typeof updateUserSchema>,
    userId: User['id']
    role: User['role']
    dbInstance?: typeof db
}) {
  const updateUserPayload: Partial<z.infer<typeof updateUserSchema>> = {}

  if (data.username) {
      const { isAvailable, error } = await checkFieldAvailability({ field: 'username', value: data.username, dbInstance })
      if (!isAvailable && error) {
          return {
              error: error
          }
      }else {
          updateUserPayload.username = data.username
      }
  }

  if (data.email) {
      const { isAvailable, error } = await checkFieldAvailability({ field: 'email', value: data.email, dbInstance })
      if (!isAvailable &&  error) {
          return {
              error: error
          }
      } else {
          updateUserPayload.email = data.email
      }
  }

  if (data.phoneNumber) {
      const { isAvailable, error } = await checkFieldAvailability({ field: 'phoneNumber', value: data.phoneNumber, dbInstance })
      if (!isAvailable &&  error) {
          return {
              error: error
          }
      } else {
          updateUserPayload.phoneNumber = data.phoneNumber
      }
  }

  if (data.nationalId) {
      const { isAvailable, error } = await checkFieldAvailability({ field: 'nationalId', value: data.nationalId, dbInstance })
      if (!isAvailable &&  error) {
        console.log(error)
          return {
              error: error
          }
      } else {
          updateUserPayload.nationalId = data.nationalId
      }
  }

  if (data.name) {
      updateUserPayload.name = data.name
  }


  const updatedUser = await dbInstance.update(user).set({
      ...updateUserPayload,
      role,
      updatedAt: new Date(),
  }).where(eq(user.id, userId)).returning()

  if(!updatedUser[0].createdAt) {
    return {
        error: "Coudln't update the user"
    }
  }

  return {
      success: true,
      message: 'User updated successfully!',
      userId: updatedUser[0].id,
  }
}

export async function updateUserRole({ userId, role, dbInstance = db }: {
    userId: User['id']
    role: User['role'] 
    dbInstance?: typeof db
}) {
    const [updatedUserRole] = await dbInstance.update(user).set({
        role: role
    })
    .where(eq(user.id, userId))
    .returning({ id: user.id })

    if(!updatedUserRole.id) return {
        error: "Failed to update user role"
    }

    return {
        error: null,
        message: 'User role updated!'
    }
}

// 1️⃣ Explicitly define Tables type
type Tables = keyof typeof tableMap;

// 2️⃣ Ensure tableMap is correctly typed
const tableMap: Record<string, any> = {
    user,
    doctor,
    schedule,
    session,
    account,
    appointment,
};

export async function deleteById(id: string, tableName: Tables) {
    const table = tableMap[tableName];

    if (!table) {
        throw new Error(`Invalid table name: ${tableName}`);
    }

    if (tableName === "appointment") {
        const files = await db
            .select({
                id: medicalFile.id,
                name: medicalFile.name,
            })
            .from(medicalFile)
            .where(eq(medicalFile.appointmentId, id));

        if (files.length > 0) {
            await Promise.all(
                files.map(async (file) => {
                    try {
                        await deleteFile(file.name);
                    } catch (error) {
                        console.error(`Error deleting file: ${file.name}`, error);
                    }
                })
            );

            await db.delete(medicalFile).where(eq(medicalFile.appointmentId, id));
        }
    }

    const deleted = await db.delete(table).where(eq(table.id, id)).returning();

    if (deleted.length > 0) {
        revalidatePath("/dashboard");
        return { message: "Record deleted successfully" };
    } else {
        throw new Error("Failed to delete the record");
    }
}