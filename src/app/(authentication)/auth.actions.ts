'use server'

import { TAuthSchema, TOnBoardingSchema } from "@/app/(authentication)/auth.types"
import { emailOtp } from "@/lib/auth-client"
import db from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function checkEmailAvailability(data: TAuthSchema) {
    const result = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.email, data.email)
    })

    return {
        available: !result
    }
}

export async function onBoarding(data: { userId: string } & TOnBoardingSchema) {
    const isUsernameExists = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.username, data.username)
    })

    if (isUsernameExists) {
        return {
            error: 'Username exists!'
        }
    };

    const result = await db.update(user)
        .set({
            name: data.name,
            username: data.username,
            email: data.email,
            bio: data.bio,
            onBoarding: false
        })
        .where(eq(user.id, data.userId))

    if (!result) throw new Error('profile not updated');

    return {
        updated: result
    };
}


export async function verifyOtp(data: { email: string, otp: string }) {

    const result = await emailOtp.verifyEmail({
        email: data.email,
        otp: data.otp
    })

    return result;
}