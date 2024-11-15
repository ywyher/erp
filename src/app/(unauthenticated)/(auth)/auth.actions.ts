'use server'

import { TAuthSchema, TUpdateUserSchema } from "@/app/(unauthenticated)/(authentication)/auth.types"
import db from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function checkColumnAvailability(column: string, columnType: 'email' | 'phoneNumber') {
    const result = await db.query.user.findFirst({
        where: (user, { eq }) => {
            switch (columnType) {
                case 'email':
                    return eq(user.email, column)
                case 'phoneNumber':
                    return eq(user.phoneNumber, column)
            }
        }
    })


    return {
        isAvailable: result ? false : true
    }
}

export async function updateUser(data: { value: string, context: 'email' | 'phoneNumber', userId: string } & TUpdateUserSchema) {
    const isUsernameNotAvailable = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.username, data.username)
    })

    if (isUsernameNotAvailable) {
        return {
            error: 'Username not available!'
        }
    };

    if (data.context == 'phoneNumber' && data.email) {
        const isEmailNotAvailable = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.email, data.email || '')
        })

        if (isEmailNotAvailable) {
            return {
                error: "Email not available!"
            }
        }
    }

    if (data.context == 'email' && data.phoneNumber) {
        const isPhoneNumberNotAvailable = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.phoneNumber, data.phoneNumber || '')
        })

        if (isPhoneNumberNotAvailable) {
            return {
                error: "Phone Number not available!"
            }
        }
    }

    const updateData = {
        name: data.name,
        username: data.username,
        bio: data.bio,
        onBoarding: false,
        ...(data.email && { email: data.email }),
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber })
    };

    const result = await db.update(user)
        .set(updateData)
        .where(eq(user.id, data.userId));

    if (!result) throw new Error('profile not updated');

    return {
        success: true
    };
}


export default async function UpdatePhoneNumberVerified(userId: string) {
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