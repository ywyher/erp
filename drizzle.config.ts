import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts", // where your schemas is
  out: "./migrations", // where your migrations will be generated
  dialect: "postgresql", // the driver you are using
  dbCredentials: {
    url: process.env.POSTGRES_URL!, // your database url
  },
  verbose: true, // generating migrations will tell you what have changed
  strict: true, // when running the migrations if it needs to change something it will tell you
});