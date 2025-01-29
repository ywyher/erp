'use server'

import { userSchema } from "@/app/types"
import db from "@/lib/db"
import { user } from "@/lib/db/schema"
import { deleteFile, getPreSignedUrl } from "@/lib/s3"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return hashHex
}

export async function uploadToS3({
    file,
}: {
    file: File;
}) {
    const checksum = await computeSHA256(file);

    const presignedUrl = await getPreSignedUrl({
        type: file.type,
        size: file.size,
        checksum: checksum,
    });

    if (presignedUrl.failure) {
        return { error: "Not authenticated", file: file.name };
    }

    const { url, fileName } = presignedUrl.success;

    if (!url || !fileName) {
        return { error: "Failed to get pre-signed URL", file: file.name };
    }

    try {
        await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": file.type,
            },
            body: file,
        });

        return { name: fileName, size: file.size, type: file.type };
    } catch (error) {
        return { error: "Failed to upload", file: file.name };
    }
}

export async function uploadPfp({
    fileName,
    userId,
    oldFileName
}: {
    fileName: string,
    userId: string,
    oldFileName?: string
}) {

    // Check if `oldFileName` exists and is not an external provider URL
    if (oldFileName && !oldFileName.startsWith('http')) {
        await deleteFile(oldFileName);
    }

    await db.update(user)
        .set({
            image: fileName
        })
        .where(eq(user.id, userId));

    return {
        success: true
    };
}

export async function revalidate(path: string) {
    revalidatePath(path)
}