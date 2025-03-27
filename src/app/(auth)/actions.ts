"use server";

import db from "@/lib/db";
import { User, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

export async function updatePhoneNumberVerified(userId: User["id"]) {
  const result = await db
    .update(user)
    .set({
      phoneNumberVerified: true,
    })
    .where(eq(user.id, userId));

  if (!result) {
    console.error(result);
  }

  return {
    success: true,
  };
}

export async function updateOnboarding(userId: User["id"], value: boolean) {
  const updateOnboarding = await db
    .update(user)
    .set({
      onBoarding: value,
    })
    .where(eq(user.id, userId));

  if (updateOnboarding) {
    return {
      success: true,
      message: `Onboarding value updated to ${value}`,
    };
  }
}

export async function getEmail({ value, field }: {
  value: User['username'] | User['phoneNumber'],
  field: "username" | "phoneNumber"
}) {
  const column = user[field as keyof typeof user] as PgColumn;

  const data = await db.query.user.findFirst({
    columns: {
      email: true,
    },
    where: eq(column, value), // Use dynamic field access
  })

  return data?.email
}