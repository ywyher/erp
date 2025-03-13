import { pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", [
  "pending",
  "ongoing",
  "completed",
  "cancelled",
]);

export const roleEnum = pgEnum("role", [
  "user",
  "admin",
  "doctor",
  "receptionist",
]);

export const genderEnum = pgEnum("gender", [
  'male',
  'female'
])

export const socialStatusEnum = pgEnum("service_status", [
    "draft", // Service is created but not yet published
    "published", // Service is live and available to users
    "inactive", // Temporarily disabled (meaning that it had been published before)
    "archived", // Old or discontinued service, kept for records
]);