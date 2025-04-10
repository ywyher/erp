"use server";

import dotenv from "dotenv";
dotenv.config();

import * as schema from "./schema";
import db from "./index.local";
import { generateId } from "../funcs";
import { sql } from "drizzle-orm";
import { hashPassword } from "@/lib/password";

const thumbnail = "eb064c6cde7eeb81f38f6546e1fdd8aef9157d99db5aa18d39f093ea8be838d8"

const content = [
    {
      "id": "1LhQmZ3_Ax",
      "type": "h1",
      "children": [
        {
          "text": "HA ?"
        }
      ]
    },
    {
      "id": "C5TmKXq8uf",
      "type": "p",
      "indent": 1,
      "children": [
        {
          "text": "amda"
        }
      ],
      "listStyleType": "todo"
    },
    {
      "id": "VkJfnfezGx",
      "type": "p",
      "indent": 1,
      "checked": false,
      "children": [
        {
          "text": "aas"
        }
      ],
      "listStart": 2,
      "listStyleType": "todo"
    },
    {
      "id": "ZXYKpu9HSx",
      "type": "p",
      "indent": 1,
      "checked": true,
      "children": [
        {
          "text": "dam"
        }
      ],
      "listStart": 3,
      "listStyleType": "todo"
    },
    {
      "id": "aMBkopQWjF",
      "type": "p",
      "indent": 1,
      "checked": true,
      "children": [
        {
          "text": "dasda"
        }
      ],
      "listStart": 4,
      "listStyleType": "todo"
    },
    {
      "id": "rDb0OTw4nI",
      "type": "p",
      "indent": 1,
      "checked": false,
      "children": [
        {
          "text": "das"
        }
      ],
      "listStart": 5,
      "listStyleType": "todo"
    },
    {
      "id": "eON4dpsE8_",
      "type": "blockquote",
      "children": [
        {
          "text": "adsadadasdassad"
        }
      ]
    },
    {
      "id": "FiNM-iJvrc",
      "type": "p",
      "children": [
        {
          "text": ""
        }
      ]
    },
    {
      "id": "gGEgRFe9G6",
      "url": "https://pub-d074aa57b59b465ebc13b907eca3345b.r2.dev/2b4dabf8ae9d557f10fe6dd0e965e44b2f9c9314585ecfbe5f98f29491231a3f",
      "name": "2b4dabf8ae9d557f10fe6dd0e965e44b2f9c9314585ecfbe5f98f29491231a3f",
      "type": "file",
      "children": [
        {
          "text": ""
        }
      ],
      "isUpload": true,
      "placeholderId": "ZdRpZSAHHeb2UBP2qFmhK"
    },
    {
      "id": "ppRusL_jvq",
      "url": "https://pub-d074aa57b59b465ebc13b907eca3345b.r2.dev/b3b3fdb6d33882eb1d8bd7fa87a81d7841c036427220603f3118327330290da2",
      "name": "b3b3fdb6d33882eb1d8bd7fa87a81d7841c036427220603f3118327330290da2",
      "type": "video",
      "children": [
        {
          "text": ""
        }
      ],
      "isUpload": true,
      "placeholderId": "YrGfQdjGsxm9Mja0_3JfS"
    },
    {
      "id": "GhjVYuydMJ",
      "url": "https://pub-d074aa57b59b465ebc13b907eca3345b.r2.dev/053f24c8af5629c1c2ce20b066bf947c16ce0a2700619e5b59f753af466d0374",
      "name": "053f24c8af5629c1c2ce20b066bf947c16ce0a2700619e5b59f753af466d0374",
      "type": "audio",
      "children": [
        {
          "text": ""
        }
      ],
      "isUpload": true,
      "placeholderId": "iiltkQZh0uPGpKu4e10a1"
    },
    {
      "id": "JdjfW5WwCm",
      "url": "https://pub-d074aa57b59b465ebc13b907eca3345b.r2.dev/a512dad880016dca44a96115fdcc13aa9b5cff5b452cf550e288bbbedc5b7906",
      "name": "a512dad880016dca44a96115fdcc13aa9b5cff5b452cf550e288bbbedc5b7906",
      "type": "img",
      "children": [
        {
          "text": ""
        }
      ],
      "isUpload": true,
      "placeholderId": "iAzujiXeii9kRgtPuzb6B"
    },
    {
      "id": "dcRsVpG90Y",
      "url": "https://pub-d074aa57b59b465ebc13b907eca3345b.r2.dev/771c2f4a7b3e4591a46639bc7496851eb0eeea38c2152f6bcaf3171aa23b081c",
      "name": "771c2f4a7b3e4591a46639bc7496851eb0eeea38c2152f6bcaf3171aa23b081c",
      "type": "img",
      "children": [
        {
          "text": ""
        }
      ],
      "isUpload": true,
      "placeholderId": "Csza55ZHQnpOGwdvNOSvK"
    },
    {
      "id": "AVOvv_NTvB",
      "url": "https://pub-d074aa57b59b465ebc13b907eca3345b.r2.dev/4e42aa37d6f0e1a97456fa238ee9723c8936648238d51371fc90d5de47f15976",
      "name": "4e42aa37d6f0e1a97456fa238ee9723c8936648238d51371fc90d5de47f15976",
      "type": "img",
      "children": [
        {
          "text": ""
        }
      ],
      "isUpload": true,
      "placeholderId": "9JhMGvx_fQpDU5BdBdvve"
    },
    {
      "id": "etv6WoJrxN",
      "type": "p",
      "children": [
        {
          "text": ""
        }
      ]
    }
  ]

export async function reset() {
  try {
    // Truncate all tables
    await db.execute(sql`
      TRUNCATE TABLE "verification", "account", "session", "medical_file", 
      "appointment", "schedule", "receptionist", "doctor", "user", "post", "service" CASCADE;
    `);

    console.log("Database reset successfully");
    return {
      message: "Database reset successfully",
    };
  } catch (error) {
    console.error("Error resetting and seeding database:", error);
    return {
      error: error,
    };
  }
}

export async function seed() {
  try {
    // Create a doctor user
    const doctorUser = await db
      .insert(schema.user)
      .values({
        id: generateId(),
        name: "doctor",
        username: "doctor",
        email: "doctor@gmail.com",
        phoneNumber: "01024824715",
        nationalId: "30801201100193",
        phoneNumberVerified: true,
        emailVerified: true,
        role: "doctor",
        gender: 'male',
        dateOfBirth: '2003-01-20',
        provider: 'email',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create a doctor
    const doctor = await db
      .insert(schema.doctor)
      .values({
        id: generateId(),
        specialty: "General Practice",
        userId: doctorUser[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create a schedule for the doctor
    await db.insert(schema.schedule).values({
      id: generateId(),
      day: "monday",
      startTime: "09:00",
      endTime: "17:00",
      userId: doctorUser[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create an admin user
    const adminUser = await db
      .insert(schema.user)
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
      })
      .returning();

      // Create an admin
      const admin = await db
      .insert(schema.admin)
      .values({
        id: generateId(),
        userId: adminUser[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create a receptionist user
    const receptionistUser = await db
      .insert(schema.user)
      .values({
        id: generateId(),
        name: "receptionist",
        username: "receptionist",
        email: "receptionist@gmail.com",
        phoneNumber: "01024824717",
        nationalId: "30801201100194",
        phoneNumberVerified: true,
        emailVerified: true,
        role: "receptionist",
        provider: 'email',
        gender: 'female',
        dateOfBirth: '2008-01-20',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create a receptionist
    await db
      .insert(schema.receptionist)
      .values({
        id: generateId(),
        userId: receptionistUser[0].id,
        department: "general",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create a schedule for the doctor
    await db.insert(schema.schedule).values({
      id: generateId(),
      day: "monday",
      startTime: "09:00",
      endTime: "17:00",
      userId: receptionistUser[0].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create a normal user
    const normalUser = await db
      .insert(schema.user)
      .values({
        id: generateId(),
        name: "user",
        username: "user",
        email: "user@gmail.com",
        phoneNumber: "01558854716",
        nationalId: "30801201100192",
        phoneNumberVerified: true,
        emailVerified: true,
        role: "user",
        gender: 'female',
        provider: 'email',
        dateOfBirth: '205-02-25',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create two appointments for the normal user
    for (let i = 0; i < 2; i++) {
      await db.insert(schema.appointment).values({
        id: generateId(),
        patientId: normalUser[0].id,
        doctorId: doctor[0].id,
        creatorId: receptionistUser[0].id,
        startTime: new Date(`2023-06-${15 + i}T10:00:00`),
        endTime: new Date(`2023-06-${15 + i}T11:00:00`),
        status: "pending",
        createdBy: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create account entries for all users
    const users = [
      doctorUser[0],
      adminUser[0],
      receptionistUser[0],
      normalUser[0],
    ];
    for (const user of users) {
      await db.insert(schema.account).values({
        id: generateId(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: await hashPassword(user.role), // In a real scenario, ensure this is properly hashed
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await db.insert(schema.service).values({
      id: generateId(),
      creatorId: admin[0].id,
      icon: "User",
      title: "user",
      createdAt: new Date(),
      status: 'published',
      updatedAt: new Date()
    })

    await db.insert(schema.service).values({
      id: generateId(),
      creatorId: admin[0].id,
      icon: "Pen",
      title: "pen",
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await db.insert(schema.service).values({
      id: generateId(),
      creatorId: admin[0].id,
      icon: "Spline",
      title: "spline",
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await db.insert(schema.service).values({
      id: generateId(),
      creatorId: admin[0].id,
      icon: "Ruler",
      title: "ruler",
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await db.insert(schema.post).values({
      id: generateId(),
      authorId: adminUser[0].id,
      category: 'news',
      slug: 'post-1234',
      title: 'Breaking News: Tech Advances',
      content,
      thumbnail,
      tags: 'technology, update',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await db.insert(schema.post).values({
      id: generateId(),
      authorId: adminUser[0].id,
      category: 'news',
      slug: 'gaming-future-5678',
      title: 'The Future of Gaming',
      content,
      thumbnail,
      tags: 'gaming, trends',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await db.insert(schema.post).values({
      id: generateId(),
      authorId: adminUser[0].id,
      category: 'article',
      slug: 'ai-revolution-9101',
      title: 'AI Revolution: What’s Next?',
      content,
      thumbnail,
      tags: 'AI, innovation',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await db.insert(schema.post).values({
      id: generateId(),
      authorId: adminUser[0].id,
      category: 'article',
      slug: 'crypto-market-1121',
      title: 'Crypto Market Update',
      content,
      thumbnail,
      tags: 'cryptocurrency, finance',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await db.insert(schema.post).values({
      id: generateId(),
      authorId: adminUser[0].id,
      category: 'article',
      slug: 'space-exploration-3141',
      title: 'Space Exploration Breakthroughs',
      content,
      thumbnail,
      tags: 'space, science',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await db.insert(schema.post).values({
      id: generateId(),
      authorId: adminUser[0].id,
      category: 'article',
      slug: 'cybersecurity-trends-5161',
      title: 'Cybersecurity Trends 2025',
      content,
      thumbnail,
      tags: 'security, IT',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await db.insert(schema.post).values({
      id: generateId(),
      authorId: adminUser[0].id,
      category: 'news',
      slug: 'health-tech-7181',
      title: 'The Rise of Health Tech',
      content: content,
      thumbnail: thumbnail,
      tags: 'health, technology',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await Promise.all(
      Array.from({ length: 8 }).map((_, idx) =>
        db.insert(schema.faq).values({
          id: generateId(),
          creatorId: admin[0].id,
          question: idx.toString(),
          answer: idx.toString(),
          status: "published",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      )
    );
    
    console.log("Seed data inserted successfully!");
    return {
      message: "Seed data inserted successfully!",
    };
  }  catch (error: unknown) {
    if (error instanceof Error) {
      return { message: null, error: error.message };
    } else {
      console.error(`Unknown error:`);
      return { message: null, error: error };
    }
  }
}