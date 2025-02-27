import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { appointment } from "./appointment";
import { doctor, user } from "./roles";
import { prescription } from "@/lib/db/schema/prescription";

export const consultation = pgTable("consultation", {
  id: text("id").primaryKey(),
  appointmentId: text("appointmentId")
    .references(() => appointment.id, { onDelete: "cascade" })
    .notNull(),
  doctorId: text("doctorId")
    .references(() => doctor.id, { onDelete: "cascade" })
    .notNull(),
  patientId: text("patientId")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  diagnosis: text("diagnosis").notNull(),
  history: text("history").notNull(),
  laboratories: text("laboratories"),
  radiologies: text("radiologies"),
  medicines: text("medicines"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const consultationRelations = relations(
  consultation,
  ({ one, many }) => ({
    appointment: one(appointment, {
      fields: [consultation.appointmentId],
      references: [appointment.id],
    }),
    doctor: one(doctor, {
      fields: [consultation.doctorId],
      references: [doctor.id],
    }),
    user: one(user, {
      fields: [consultation.patientId],
      references: [user.id],
    }),
    prescriptions: many(prescription),
  }),
);
