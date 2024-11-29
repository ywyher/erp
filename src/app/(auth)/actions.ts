'use server'

import { userSchema } from "@/app/types"
import db from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"


export async function updatePhoneNumberVerified(userId: string) {
    const result = await db.update(user).set({
        phoneNumberVerified: true
    })
        .where(eq(user.id, userId))

    if (!result) {
        console.error(result)
    }

    return {
        success: true
    }
}

export async function updateOnboarding(userId: string, value: boolean) {
    const updateOnboarding = await db.update(user).set({
        onBoarding: value
    })

    if (updateOnboarding) {
        return {
            success: true,
            message: `Onboarding value updated to ${value}`
        }
    }
}