'use server'

import { settingSchema } from "@/app/(authenticated)/dashboard/settings/types";
import db from "@/lib/db";
import { settings, User } from "@/lib/db/schema";
import { generateId } from "@/lib/funcs";
import { deleteFile } from "@/lib/s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function createSetting({ data, creatorId }: { data: z.infer<typeof settingSchema>, creatorId: User['id'] }) {

  const settingId = generateId();

  const [createdSetting] = await db.insert(settings).values({
    id: settingId,
    key: data.key,
    value: data.value,
    description: data.description,
    createdBy: creatorId,
    updatedBy: creatorId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: settings.id })

  if(!createdSetting.id) return {
    error: "Couldn't create the desired setting!!"
  }

  revalidatePath('/dashboard/settings')
  return {
    message: "Setting created!",
    settingId: createdSetting.id,
    error: null,
  }
}

export async function updateSetting({
  data,
  editorId,
  settingKey,
}: {
  data: z.infer<typeof settingSchema>
  editorId: User["id"]
  settingKey: string
}) {
  const updateData: Partial<typeof settings.$inferInsert> = {
    updatedBy: editorId,
    updatedAt: new Date(),
  }

  if (data.key !== undefined) updateData.key = data.key
  if (data.value !== undefined) updateData.value = data.value
  if (data.description !== undefined) updateData.description = data.description

  const [updatedSetting] = await db
    .update(settings)
    .set(updateData)
    .where(eq(settings.key, settingKey))
    .returning({ id: settings.id })

    console.log(updatedSetting)

  if(!updatedSetting.id) {
    await deleteFile(data.value)
    return {
      error: "Couldn't update the desired setting!!"
    }
  }
  
  revalidatePath('/dashboard/settings')
  return {
    message: "Setting updated successfully!",
    settingId: updatedSetting.id,
    error: null,
  }
}