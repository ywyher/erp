import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { admin } from "./roles";
import { relations } from "drizzle-orm";
import { socialStatusEnum } from "@/lib/db/schema/enums";

export const service = pgTable("service", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  thumbnail: text("thumbnail").notNull(),
  creatorId: text("creatorId")
    .references(() => admin.id, { onDelete: "cascade" })
    .notNull(),
  status: socialStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const serviceRelation = relations(service, ({ one }) => ({
  admin: one(admin, {
    fields: [service.creatorId],
    references: [admin.id],
  }),
}));