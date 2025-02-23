'use server'

import { z } from "zod"
import { checkFieldAvailability } from "./queries"
import { Roles, userSchema } from "@/app/types"
import db from "."
import { account, appointment, doctor, medicalFile, schedule, session, User, user } from "./schema"
import { eq } from "drizzle-orm"
import { createUserSchema } from "@/app/(authenticated)/dashboard/types"
import { generateFakeField, generateId } from "../funcs"
import { hashPassword } from "../password"
import { deleteFile } from "@/lib/s3"
import { revalidatePath } from "next/cache"

export async function createUser({ data, role }: { data: z.infer<typeof createUserSchema>, role: Roles }) {
    const createPayload: Partial<z.infer<typeof createUserSchema>> = {}

    const { error: usernameError } = await checkFieldAvailability({ field: 'username', value: data.username })
    if (usernameError) {
        return {
            error: usernameError
        }
    }

    const { error: nationalIdError } = await checkFieldAvailability({ field: 'nationalId', value: data.nationalId })
    if (nationalIdError) {
        return {
            error: nationalIdError
        }
    }

    if (data.email) {
        const { error } = await checkFieldAvailability({ field: 'email', value: data.email })
        if (error) {
            return {
                error: error
            }
        } else {
            createPayload.email = data.email
        }
    } else {
        createPayload.email = generateFakeField("email", data.phoneNumber)
    }

    if (data.phoneNumber) {
        const { error } = await checkFieldAvailability({ field: 'phoneNumber', value: data.phoneNumber })
        if (error) {
            return {
                error: error
            }
        } else {
            createPayload.phoneNumber = data.phoneNumber
        }
    }

    const userId = generateId()
    const accountId = generateId()

    const createdUser = await db.insert(user).values({
        id: userId,
        name: data.name,
        username: data.username,
        ...createPayload,
        nationalId: data.nationalId,
        role: role,
        onBoarding: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning({
        id: user.id
    })

    const createdUserAccount = await db.insert(account).values({
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
    })

    if (createdUser && createdUserAccount) {
        return {
            success: true,
            message: 'User created successfully!',
            userId: createdUser[0].id,
        }
    }
}

export async function updateUser({ data, userId }: { data: z.infer<typeof userSchema>, userId: string }) {
  const updateUserPayload: Partial<z.infer<typeof userSchema>> = {}

  if (data.username) {
      const { isAvailable, error } = await checkFieldAvailability({ field: 'username', value: data.username })
      if (!isAvailable && error) {
          return {
              error: error
          }
      }else {
          updateUserPayload.username = data.username
      }
  }

  if (data.email) {
      const { isAvailable, error } = await checkFieldAvailability({ field: 'email', value: data.email })
      if (!isAvailable &&  error) {
          return {
              error: error
          }
      } else {
          updateUserPayload.email = data.email
      }
  }

  if (data.phoneNumber) {
      const { isAvailable, error } = await checkFieldAvailability({ field: 'phoneNumber', value: data.phoneNumber })
      if (!isAvailable &&  error) {
          return {
              error: error
          }
      } else {
          updateUserPayload.phoneNumber = data.phoneNumber
      }
  }

  if (data.nationalId) {
      const { isAvailable, error } = await checkFieldAvailability({ field: 'nationalId', value: data.nationalId })
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


  const updatedUser = await db.update(user).set({
      ...updateUserPayload,
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
        // ✅ Handle related medical files first
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

            // ✅ Delete medical file records
            await db.delete(medicalFile).where(eq(medicalFile.appointmentId, id));
        }
    }

    // ✅ Delete the main record
    const deleted = await db.delete(table).where(eq(table.id, id)).returning();

    if (deleted.length > 0) {
        revalidatePath("/dashboard");
        return { message: "Record deleted successfully" };
    } else {
        throw new Error("Failed to delete the record");
    }
}