'use server'

import { userSchema } from "@/app/types"
import db from "@/lib/db"
import { checkFieldInUserTable } from "@/lib/db/queries"
import { user } from "@/lib/db/schema"
import { deleteFile, getPreSignedUrl } from "@/lib/s3"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function updateUser({ data, userId }: { data: z.infer<typeof userSchema>, userId: string }) {
    const updateUserPayload: Partial<z.infer<typeof userSchema>> = {}

    if (data.username) {
        const { error } = await checkFieldInUserTable({ field: 'username', value: data.username })
        if (error) {
            console.log(error)
            return {
                error: error
            }
        }
    }

    if (data.email) {
        const { error } = await checkFieldInUserTable({ field: 'email', value: data.email })
        if (error) {
            console.log(error)
            return {
                error: error
            }
        } else {
            updateUserPayload.email = data.email
        }
    }

    if (data.phoneNumber) {
        const { error } = await checkFieldInUserTable({ field: 'phoneNumber', value: data.phoneNumber })
        if (error) {
            console.log(error)
            return {
                error: error
            }
        } else {
            updateUserPayload.phoneNumber = data.phoneNumber
        }
    }

    if (data.name) {
        updateUserPayload.name = data.name
    }

    if (data.username) {
        updateUserPayload.username = data.username
    }

    if (data.nationalId) {
        updateUserPayload.nationalId = data.nationalId
    }

    const updatedUser = await db.update(user).set({
        ...updateUserPayload,
        updatedAt: new Date(),
    }).where(eq(user.id, userId)).returning()

    if (updatedUser) {
        return {
            success: true,
            message: 'User updated successfully!',
            userId: updatedUser[0].id,
        }
    }
}

export const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return hashHex
}

export async function uploadToS3({ file }: { file: File }) {
    const checksum = await computeSHA256(file)

    const presinedUrl = await getPreSignedUrl({
        type: file.type,
        size: file.size,
        checksum: checksum
    })

    if (presinedUrl.failure) {
        console.log('Not authenticated')
        return;
    }

    const { url, fileName } = presinedUrl.success

    if (!url || !fileName) throw new Error('Failed to get pre-signed URL')

    await fetch(url, {
        method: 'PUT',
        headers: {
            "Content-Type": file.type,
        },
        body: file
    })

    return {
        fileName: fileName
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
    await revalidatePath(path)
}