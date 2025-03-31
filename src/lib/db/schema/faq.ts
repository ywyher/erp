import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { admin } from "./roles";
import { relations } from "drizzle-orm";
import { socialStatusEnum } from "@/lib/db/schema/enums";

export const faq = pgTable("faq", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  creatorId: text("creatorId")
    .references(() => admin.id, { onDelete: "cascade" })
    .notNull(),
  status: socialStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const faqRelation = relations(faq, ({ one }) => ({
  admin: one(admin, {
    fields: [faq.creatorId],
    references: [admin.id],
  }),
}));