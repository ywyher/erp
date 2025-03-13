import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { admin } from "./roles";
import { relations } from "drizzle-orm";
import { socialStatusEnum } from "@/lib/db/schema/enums";

export const news = pgTable("news", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  thumbnail: text("thumbnail").notNull(),
  authorId: text("authorId")
    .references(() => admin.id, { onDelete: "cascade" })
    .notNull(),
  status: socialStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const newsRelation = relations(news, ({ one }) => ({
  admin: one(admin, {
    fields: [news.authorId],
    references: [admin.id],
  }),
}));