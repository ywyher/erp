import { jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { doctor, user } from "./roles";
import { relations } from "drizzle-orm";
import { appointment, createdByEnum } from "./appointment";
import { statusEnum } from "@/lib/db/schema/enums";

export const operationTypeEnum = pgEnum("type", ["surgical"]);

// Medical files for appointments
export const operation = pgTable("operation", {
  id: text("id").primaryKey(),
  patientId: text("patientId")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  doctorId: text("doctorId")
    .references(() => doctor.id, { onDelete: "cascade" })
    .notNull(),
  appointmentId: text("appointmentId").references(() => appointment.id, {
    onDelete: "cascade",
  }),
  creatorId: text("creatorId").references(() => user.id, {
    onDelete: "cascade",
  }),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  status: statusEnum("status").notNull().default("pending"),
  type: operationTypeEnum("type").notNull(),
  createdBy: createdByEnum("createdBy").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const operationRelation = relations(operation, ({ one }) => ({
  user: one(user, {
    fields: [operation.patientId],
    references: [user.id],
  }),
  doctor: one(doctor, {
    fields: [operation.doctorId],
    references: [doctor.id],
  }),
  appointment: one(appointment, {
    fields: [operation.appointmentId],
    references: [appointment.id],
  }),
  operationData: one(operationData, {
    fields: [operation.id],
    references: [operationData.operationId],
  }),
}));

export const operationData = pgTable("operation_data", {
  id: text("id").primaryKey(),
  data: jsonb("data").default("{}").notNull().$type<Record<string, string>>(),
  documentName: text("documentName").notNull(),
  operationId: text("operationId")
    .references(() => operation.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
});

export const operationDataRelation = relations(operationData, ({ one }) => ({
  operation: one(operation, {
    fields: [operationData.operationId],
    references: [operation.id],
  }),
}));
