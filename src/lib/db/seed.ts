'use server'

import db from "@/lib/db";
import { admin, user } from "@/lib/db/schema";
import { generateId } from "@/lib/funcs";

async function main() {
  console.log("🌱 Starting database seeding...");
  
  const existingAdmin = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.username, "admin"),
  });

  if (!existingAdmin) {
    console.log("Creating admin user...");
    
    const adminUser = await db
      .insert(user)
      .values({
        id: generateId(),
        name: "admin",
        username: "admin",
        email: "admin@gmail.com",
        phoneNumber: "01024824716",
        nationalId: "30801201100191",
        phoneNumberVerified: true,
        emailVerified: true,
        role: "admin",
        gender: 'male',
        provider: 'email',
        dateOfBirth: '1971-07-14',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: user.id })

    await db
      .insert(admin)
      .values({
        id: generateId(),
        userId: adminUser[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: admin.id });
    
    console.log("Admin user created successfully");
  } else {
    console.log("Admin user already exists, skipping");
  }

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