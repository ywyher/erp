'use server'

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { admin } from "@/lib/db/schema";
import { generateId } from "@/lib/funcs";

async function main() {
  console.log("🌱 Starting database seeding...");

  const { user } = await auth.api.signUpEmail({
    body: {
      email: "admin@perfect-health.net",
      password: "Pmssa16771@",
      name: "admin",
      dateOfBirth: new Date().toISOString().split('T')[0],
      displayUsername: 'admin',
      gender: 'male',
      nationalId: '30801201100191',
      phoneNumber: '01024824716',
      role: "admin",
      username: 'admin',
      provider: 'email'
    }
  })

  await db
    .insert(admin)
    .values({
      id: generateId(),
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
  })

  console.log("✅ Database seeding completed");
}

main()
  .catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
});