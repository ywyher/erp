"use server";

import db from "@/lib/db";
import { user } from "@/lib/db/schema";
import { deleteFile } from "@/lib/s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

export async function uploadPfp({
  fileName,
  userId,
  oldFileName,
}: {
  fileName: string;
  userId: string;
  oldFileName?: string;
}) {
  // Check if `oldFileName` exists and is not an external provider URL
  if (oldFileName && !oldFileName.startsWith("http")) {
    await deleteFile(oldFileName);
  }

  await db
    .update(user)
    .set({
      image: fileName,
    })
    .where(eq(user.id, userId));

  return {
    success: true,
  };
}

export async function revalidate(path: string) {
  revalidatePath(path);
}
