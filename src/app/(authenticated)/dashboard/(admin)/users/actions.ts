'use server'

import db from "@/lib/db"
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUsers() {
    return await db.select().from(user)
        .where(eq(user.role, 'user'));
}