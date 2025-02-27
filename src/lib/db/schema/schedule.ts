import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./roles";

// Schedule

export const dayEnum = pgEnum("day", [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

export const schedule = pgTable("schedule", {
  id: text("id").primaryKey(),
  day: dayEnum("day").notNull(),
  startTime: text("startTime").notNull(), // first work hour for a certain day
  endTime: text("endTime").notNull(), // last work hour for a certain day
  userId: text("userId")
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const scheduleRelation = relations(schedule, ({ one }) => ({
  user: one(user, {
    fields: [schedule.userId],
    references: [user.id],
  }),
}));
