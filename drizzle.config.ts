import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts", // where your schemas is
  out: "./migrations", // where your migrations will be generated
  dialect: "postgresql", // the driver you are using
  dbCredentials: {
    url: process.env.DATABASE_URL!, // your database url
  },
});
