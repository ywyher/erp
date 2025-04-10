"use server";

import { z } from "zod";
import { checkFieldAvailability } from "./queries";
import { tableMap, Tables, updateUserSchema } from "@/app/types";
import db from "./index.local";
import {
  account,
  medicalFile,
  session,
  User,
  user,
} from "./schema";
import { eq } from "drizzle-orm";
import { createUserSchema } from "@/app/types";
import { generateFakeField, generateId } from "../funcs";
import { hashPassword } from "../password";
import { deleteFile } from "@/lib/s3";
import { revalidatePath } from "next/cache";
import { deletePost } from "@/app/(authenticated)/dashboard/posts/actions";

export async function createUser({
  data,
  role,
  verified = false,
  dbInstance = db,
}: {
  data: z.infer<typeof createUserSchema>;
  role: User["role"];
  verified?: boolean;
  dbInstance?: typeof db;
}) {
  try {
    const createPayload: Partial<z.infer<typeof createUserSchema>> = {};

    // Run availability checks BEFORE starting the transaction
    const { error: usernameError } = await checkFieldAvailability({
      field: "username",
      value: data.username,
      dbInstance,
    });
    if (usernameError) throw new Error(usernameError);

    const { error: nationalIdError } = await checkFieldAvailability({
      field: "nationalId",
      value: data.nationalId,
      dbInstance,
    });
    if (nationalIdError) throw new Error(nationalIdError);

    if (data.email) {
      const { error } = await checkFieldAvailability({
        field: "email",
        value: data.email,
        dbInstance,
      });
      if (error) throw new Error(error);
      createPayload.email = data.email;
    } else {
      createPayload.email = generateFakeField("email", data.phoneNumber);
    }

    if (data.phoneNumber) {
      const { error } = await checkFieldAvailability({
        field: "phoneNumber",
        value: data.phoneNumber,
        dbInstance,
      });
      if (error) throw new Error(error);
      createPayload.phoneNumber = data.phoneNumber;
    }

    return await dbInstance.transaction(async (tx) => {
      const userId = generateId();
      const accountId = generateId();

      const createdUser = await tx
        .insert(user)
        .values({
          id: userId,
          name: data.name,
          username: data.username,
          ...createPayload,
          emailVerified: createPayload.email && verified,
          phoneNumberVerified: createPayload.phoneNumber && verified,
          nationalId: data.nationalId,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth.toISOString().split('T')[0],
          role: role,
          provider: 'email',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: user.id });

      if (!createdUser || !createdUser[0]?.id) {
        throw new Error("Failed to create user.");
      }

      const createdUserAccount = await tx.insert(account).values({
        id: accountId,
        accountId: userId,
        providerId: "credential",
        userId: userId,
        accessToken: "",
        refreshToken: "",
        idToken: "",
        password: await hashPassword(data.password),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (!createdUserAccount) {
        throw new Error("Failed to create user account.");
      }

      return {
        success: true,
        message: "User created successfully!",
        userId: createdUser[0].id,
        error: null,
      };
    });
  }  catch (error: unknown) {
  // Type guard to check if error is an Error object
  if (error instanceof Error) {
    return { message: null, error: error.message, userId: null };
  } else {
    return { message: null, error: "Failed to delete file!", userId: null };
  }
}
}

export async function updateUser({
  data,
  userId,
  dbInstance = db,
  role,
}: {
  data: z.infer<typeof updateUserSchema>;
  userId: User["id"];
  role: User["role"];
  dbInstance?: typeof db;
}) {
  try {
    const updateUserPayload: Partial<z.infer<typeof updateUserSchema>> = {};

    if (data.username) {
      const { isAvailable, error } = await checkFieldAvailability({
        field: "username",
        value: data.username,
        dbInstance,
      });
      if (!isAvailable && error) {
        throw new Error(error);
      } else {
        updateUserPayload.username = data.username;
      }
    }

    if (data.email) {
      const { isAvailable, error } = await checkFieldAvailability({
        field: "email",
        value: data.email,
        dbInstance,
      });
      if (!isAvailable && error) {
        throw new Error(error);
      } else {
        updateUserPayload.email = data.email;
      }
    }

    if (data.phoneNumber) {
      const { isAvailable, error } = await checkFieldAvailability({
        field: "phoneNumber",
        value: data.phoneNumber,
        dbInstance,
      });
      if (!isAvailable && error) {
        throw new Error(error);
      } else {
        updateUserPayload.phoneNumber = data.phoneNumber;
      }
    }

    if (data.nationalId) {
      const { isAvailable, error } = await checkFieldAvailability({
        field: "nationalId",
        value: data.nationalId,
        dbInstance,
      });
      if (!isAvailable && error) {
        console.log(error);
        throw new Error(error);
      } else {
        updateUserPayload.nationalId = data.nationalId;
      }
    }

    if (data.name) {
      updateUserPayload.name = data.name;
    }

    if (data.gender) {
      updateUserPayload.gender = data.gender;
    }
    
    if (data.nationalId) {
      updateUserPayload.nationalId = data.nationalId;
    }

    if (data.dateOfBirth) {
      updateUserPayload.dateOfBirth = data.dateOfBirth.toISOString().split('T')[0];
    }

    const updatedUser = await dbInstance
      .update(user)
      .set({
        ...updateUserPayload,
        role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    if (!updatedUser[0].createdAt) {
      throw new Error("Coudln't update the user");
    }

    return {
      success: true,
      message: "User updated successfully!",
      userId: updatedUser[0].id,
      error: null,
    };
  } catch (error: unknown) {
    // Type guard to check if error is an Error object
    if (error instanceof Error) {
      return { 
        success: false,
        message: null,
        userId: null,
        error: error.message
      };
    } else {
      return { 
        success: false,
        message: null,
        userId: null,
        error: "Failed to delete file!" 
      };
    }
  } 
}

export async function updateUserRole({
  userId,
  role,
  dbInstance = db,
}: {
  userId: User["id"];
  role: User["role"];
  dbInstance?: typeof db;
}) {
  const [updatedUserRole] = await dbInstance
    .update(user)
    .set({
      role: role,
    })
    .where(eq(user.id, userId))
    .returning({ id: user.id });

  if (!updatedUserRole.id)
    return {
      error: "Failed to update user role",
    };

  return {
    error: null,
    message: "User role updated!",
  };
}

export async function deleteById(id: string, tableName: Tables) {
  const table = tableMap[tableName];

  if (!table) {
    throw new Error(`Invalid table name: ${tableName}`);
  }

  if(tableName === 'post') {
    await deletePost({ id })
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
        }),
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

export async function revokeUserSessions(userId: string) {
  await db.delete(session).where(eq(session.userId, userId));

  return {
    success: true,
    message: "User sessions revoked!",
  };
}
