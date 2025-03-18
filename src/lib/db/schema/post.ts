import { jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./roles";
import { relations } from "drizzle-orm";
import { socialStatusEnum } from "@/lib/db/schema/enums";

export const postCategoryEnum = pgEnum("post-category", [
  "article", // Service is created but not yet published
  "news", // Service is live and available to users
]);

export const post = pgTable("post", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: jsonb("content").notNull(),
  thumbnail: text("thumbnail").notNull(),
  tags: text('tags'),
  category: postCategoryEnum("category").notNull(),
  authorId: text("authorId")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  status: socialStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const postRelation = relations(post, ({ one }) => ({
  user: one(user, {
    fields: [post.authorId],
    references: [user.id],
  }),
}));