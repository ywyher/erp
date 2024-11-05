'use server'

import { emailOtp } from "@/lib/auth-client"
import db from "@/lib/db"
import { user } from "@/lib/db/schema"
import { deleteFile, getPreSignedUrl } from "@/lib/r2"
import { eq } from "drizzle-orm"

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
    oldFileName: string | undefined
}) {

    // Check if `oldFileName` exists and is not an external provider URL
    if (oldFileName && !oldFileName.startsWith('http')) {
        await deleteFile(oldFileName);
    }

    const result = await db.update(user)
        .set({
            image: fileName
        })
        .where(eq(user.id, userId));

    return result;
}


export async function getUserProvider(userId: string) {
    const result = await db.query.account.findFirst({
        where: (account, { eq }) => eq(account.userId, userId),
        columns: {
            providerId: true
        }
    })

    if (result?.providerId != 'credential') {
        return {
            provider: 'oauth'
        }
    } else if (result?.providerId == 'credential') {
        return {
            provider: 'credential'
        }
    } else {
        return {
            provider: 'unknown'
        }
    }
}