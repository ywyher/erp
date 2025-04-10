import { config } from "dotenv";
config({ path: ".env" });

import postgres from "postgres";
import { drizzle as drizzlePostgres, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type DatabaseClient = 
  | PostgresJsDatabase<typeof schema>
  | NeonHttpDatabase<typeof schema>;

const environment = process.env.ENV || "DEVELOPMENT";

function createDbClient(): DatabaseClient {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (environment === "DEVELOPMENT") {
    // Local development setup
    const client = postgres(process.env.DATABASE_URL, { max: 1 });
    const db = drizzlePostgres(client, {
      schema,
      logger: true, // Log SQL queries during development
    });
    console.log("Connected to local PostgreSQL database");
    return db;
  } else {
    // Production setup
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzleNeon({ client: sql, schema });
    console.log("Connected to Neon database");
    return db;
  }
}

const db = createDbClient();

export default db;