import { pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./roles";
import { relations } from "drizzle-orm";
import { appointment } from "./appointment";

// Medical files for appointments
export const medicalFile = pgTable("medical_file", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  patientId: text("patientId")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  appointmentId: text("appointmentId")
    .references(() => appointment.id, { onDelete: "cascade" })
    .notNull(),
});

export const medicalFileRelation = relations(medicalFile, ({ one }) => ({
  appointment: one(appointment, {
    fields: [medicalFile.appointmentId],
    references: [appointment.id],
  }),
  user: one(user, {
    fields: [medicalFile.patientId],
    references: [user.id],
  }),
}));
