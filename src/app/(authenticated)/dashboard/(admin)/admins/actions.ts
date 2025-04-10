'use server'

import db from "@/lib/db/index"
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getAdmins() {
    return await db.select().from(user)
        .where(eq(user.role, 'admin'));
}