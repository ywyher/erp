import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, pgEnum, date } from "drizzle-orm/pg-core";
import { schedule } from "./schedule";
import { appointment } from "./appointment";
import { medicalFile } from "./medical-file";
import { consultation } from "./consultation";
import { prescription } from "@/lib/db/schema/prescription";
import { operation } from "@/lib/db/schema/operation";
import { providerEnum, roleEnum } from "./enums";
import { service } from "@/lib/db/schema/service";
import { post } from "@/lib/db/schema/post";
import { preset } from "@/lib/db/schema/preset";
import { faq } from "@/lib/db/schema/faq";

// User
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").unique(),
  displayUsername: text('display_username'), // required by better-auth
  email: text("email").unique(),
  phoneNumber: text("phoneNumber").unique(),
  nationalId: text("nationalId").unique(),
  gender: text("gender"),
  dateOfBirth: date("dateOfBirth"),
  phoneNumberVerified: boolean("phoneNumberVerified").default(false).notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image").default("default").notNull(),
  role: roleEnum("role").default("user").notNull(),
  provider: providerEnum("provider").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const userRelation = relations(user, ({ one, many }) => ({
  doctor: one(doctor, {
    fields: [user.id],
    references: [doctor.userId],
  }),
  receptionist: one(receptionist, {
    fields: [user.id],
    references: [receptionist.userId],
  }),
  schedules: many(schedule),
  appointments: many(appointment),
  medicalFiles: many(medicalFile),
  consultations: many(consultation),
  prescriptions: many(prescription),
  operations: many(operation),
  posts: many(post),
}));

export const admin = pgTable("admin", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const adminRelation = relations(admin, ({ one, many }) => ({
  user: one(user, {
    fields: [admin.userId],
    references: [user.id],
  }),
  services: many(service),
  faqs: many(faq),
}));

// Doctor

export const doctor = pgTable("doctor", {
  id: text("id").primaryKey(),
  specialty: text("specialty"),
  userId: text("userId")
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const doctorRelation = relations(doctor, ({ one, many }) => ({
  user: one(user, {
    fields: [doctor.userId],
    references: [user.id],
  }),
  appointments: many(appointment),
  consultations: many(consultation),
  prescriptions: many(prescription),
  operations: many(operation),
  presets: many(preset),
}));

// Receptionist

export const departmentEnum = pgEnum("department", [
  "emergency",
  "cardiology",
  "neurology",
  "pediatrics",
  "oncology",
  "orthopedics",
  "radiology",
  "surgery",
  "obstetrics",
  "psychiatry",
  "general",
]);

export const receptionist = pgTable("receptionist", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  department: departmentEnum("department").default("general").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const receptionistRelation = relations(
  receptionist,
  ({ one }) => ({
    user: one(user, {
      fields: [receptionist.userId],
      references: [user.id],
    }),
  }),
);
