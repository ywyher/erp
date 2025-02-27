import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { doctor, receptionist, user } from "./roles";
import { relations } from "drizzle-orm";
import { medicalFile } from "./medical-file";
import { consultation } from "./consultation";
import { prescription } from "@/lib/db/schema/prescription";
import { statusEnum } from "@/lib/db/schema/enums";

// Appointment table

export const createdByEnum = pgEnum("createdBy", [
  "user",
  "receptionist",
  "doctor",
  "admin",
]);

export const appointment = pgTable("appointment", {
  id: text("id").primaryKey().notNull(),
  patientId: text("patientId")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  doctorId: text("doctorId")
    .references(() => doctor.id, { onDelete: "cascade" })
    .notNull(),
  creatorId: text("creatorId").references(() => user.id, {
    onDelete: "cascade",
  }),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  status: statusEnum("status").notNull().default("pending"),
  createdBy: createdByEnum("createdBy").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
// Relations
export const appointmentRelations = relations(appointment, ({ one, many }) => ({
  user: one(user, {
    fields: [appointment.patientId],
    references: [user.id],
  }),
  doctor: one(doctor, {
    fields: [appointment.doctorId],
    references: [doctor.id],
  }),
  consultation: one(consultation, {
    fields: [appointment.id], // appointment.id should match consultation.appointmentId
    references: [consultation.appointmentId],
  }),
  medicalFiles: many(medicalFile),
  prescriptions: many(prescription),
}));
