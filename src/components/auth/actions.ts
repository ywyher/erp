"use server";

import db from "@/lib/db/index.local";
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

export async function getEmail({ value, field }: {
  value: User['username'] | User['phoneNumber'],
  field: "username" | "phoneNumber"
}) {
  const column = user[field as keyof typeof user] as PgColumn;

  const data = await db.query.user.findFirst({
    columns: {
      email: true,
    },
    where: eq(column, value),
  })

  return data?.email
}