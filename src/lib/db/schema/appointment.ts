import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { doctor, receptionist, user } from "./roles";
import { relations } from "drizzle-orm";
import { medicalFile } from "./medical-file";
import { consultation } from "./consultation";

// Appointment table

export const appointmentStatusEnum = pgEnum('status', ['pending', 'ongoing', 'completed', 'cancelled'])
export const createdByEnum = pgEnum('createdBy', ['user', 'receptionist', 'doctor'])

export const appointment = pgTable('appointment', {
  id: text('id').primaryKey(),
  patientId: text('patientId').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  doctorId: text('doctorId').references(() => doctor.id, { onDelete: 'cascade' }).notNull(),
  receptionistId: text('receptionistId').references(() => receptionist.id, { onDelete: 'cascade' }),
  startTime: timestamp('startTime').notNull(),
  endTime: timestamp('endTime').notNull(),
  status: appointmentStatusEnum('status').notNull().default('pending'),
  createdBy: createdByEnum('createdBy').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
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
  receptionist: one(receptionist, {
    fields: [appointment.receptionistId],
    references: [receptionist.id],
  }),
  medicalFiles: many(medicalFile),
  consultations: many(consultation)
}));
