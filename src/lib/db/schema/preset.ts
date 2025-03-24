import { jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { doctor, user } from "./roles";
import { relations } from "drizzle-orm";

export const preset = pgTable("preset", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  data: jsonb("data").notNull(),
  documentName: text("documentName").notNull(),
  doctorId: text("doctorId")
    .references(() => doctor.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const presetRelation = relations(preset, ({ one }) => ({
  doctor: one(doctor, {
    fields: [preset.doctorId],
    references: [doctor.id],
  }),
}));