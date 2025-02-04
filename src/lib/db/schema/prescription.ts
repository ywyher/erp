import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { appointment } from "./appointment";
import { doctor, user } from "./roles";
import { consultation } from "@/lib/db/schema/consultation";

export const typeEnum = pgEnum('type', ['laboratory', 'radiology', 'medicine'])

export const prescription = pgTable('prescription', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  type: typeEnum('type').notNull(),
  consultationId: text('consultationId').references(() => consultation.id, { onDelete: 'cascade' }).notNull(),
  appointmentId: text('appointmentId').references(() => appointment.id, { onDelete: 'cascade' }).notNull(),
  doctorId: text('doctorId').references(() => doctor.id, { onDelete: 'cascade' }).notNull(),
  patientId: text('patientId').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const prescriptionRelations = relations(prescription, ({ one }) => ({
  appointment: one(appointment, {
    fields: [prescription.appointmentId],
    references: [appointment.id],
  }),
  consultation: one(consultation, {
    fields: [prescription.consultationId],
    references: [consultation.id],
  }),
  doctor: one(doctor, {
    fields: [prescription.doctorId],
    references: [doctor.id]
  }),
  user: one(user, {
    fields: [prescription.patientId],
    references: [user.id]
  }),
}));