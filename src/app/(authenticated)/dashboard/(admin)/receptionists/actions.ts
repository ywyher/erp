"use server";

import { createUser } from "@/lib/db/mutations";
import { Schedules } from "@/app/(authenticated)/dashboard/types";
import db from "@/lib/db";
import { deleteById } from "@/lib/db/mutations";
import { receptionist, schedule, user } from "@/lib/db/schema";
import { generateId, transformSchedulesToRecords } from "@/lib/funcs";
import { revalidatePath } from "next/cache";
import { updateUser } from "@/lib/db/mutations";
import { z } from "zod";
import {
  createReceptionistSchema,
  updateReceptionistSchema,
} from "@/app/(authenticated)/dashboard/(admin)/receptionists/types";
import { eq } from "drizzle-orm";

export async function getReceptionists({ merge = false }: { merge?: boolean }) {
  const data = await db.query.user.findMany({
    where: eq(user.role, "receptionist"),
    with: {
      receptionist: true,
      schedules: true
    }
  });

  if (merge) {
    return data.map(user => {
      // Extract the receptionist object
      const { receptionist, ...restUser } = user;
      
      // Create merged object with renamed fields
      return {
        ...restUser,
        receptionistId: receptionist.id,
        department: receptionist.department,
        // Keep schedules as is
      };
    });
  }
  
  return data;
}

export async function createReceptionist({
  userData,
  schedulesData,
}: {
  userData: z.infer<typeof createReceptionistSchema>;
  schedulesData: Schedules;
}) {
  try {
    return await db.transaction(async (tx) => {
      const createdUser = await createUser({
        data: userData,
        role: "receptionist",
        verified: true,
        dbInstance: tx,
      });

      if (
        ("error" in createdUser && createdUser.error) ||
        ("error" in createdUser && !createdUser.userId)
      ) {
        throw new Error(createdUser.error);
      }

      const receptionistId = generateId();

      await tx
        .insert(receptionist)
        .values({
          id: receptionistId,
          department: userData.department,
          userId: createdUser.userId,
        })
        .returning({
          userId: receptionist.userId,
        });

      const scheduleRecords = transformSchedulesToRecords(
        schedulesData,
        createdUser.userId,
      );
      await tx.insert(schedule).values(scheduleRecords);

      revalidatePath("/dashboard/receptionists");
      return {
        error: null,
        message: "Receptionist created successfully!",
      };
    });
  } catch (error: any) {
    return {
      error: error.message || "Failed to create receptionist",
      message: null,
    };
  }
}

export async function updateReceptionist({
  data,
  userId,
}: {
  data: z.infer<typeof updateReceptionistSchema>;
  userId: string;
}) {
  try {
    return await db.transaction(async (tx) => {
      const updatedUser = await updateUser({
        data,
        userId,
        dbInstance: tx,
        role: "receptionist",
      });

      if (!updatedUser || updatedUser.error) {
        throw new Error(updatedUser.error);
      }

      if (data.department) {
        await tx.update(receptionist).set({
          department: data.department,
        });
      }

      revalidatePath("/dashboard/receptionists");
      return {
        error: null,
        message: "Receptionist updated successfully!",
      };
    });
  } catch (error: any) {
    return {
      error: error.message,
      message: null,
    };
  }
}
