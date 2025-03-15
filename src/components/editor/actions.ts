'use server'

import db from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq, or } from "drizzle-orm"

export const listPeopleToMention = async () => {
    const people = await db.select().from(user).where(
        or(
            eq(user.role, 'doctor'),
            eq(user.role, 'admin')
        )
    );

    return people.map((person) => ({
        key: person.id,
        text: person.name,
    }));
};
