'use server'

import db from "@/lib/db"
import { User, user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function updatePhoneNumberVerified(userId: User['id']) {
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

export async function updateOnboarding(userId: User['id'], value: boolean) {
    const updateOnboarding = await db.update(user).set({
        onBoarding: value
    }).where(eq(user.id, userId))

    if (updateOnboarding) {
        return {
            success: true,
            message: `Onboarding value updated to ${value}`
        }
    }
}