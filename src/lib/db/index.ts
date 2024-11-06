import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";
import * as schema from './schema' // getting the schema

export const db = drizzle({ client: sql, schema, logger: true })

export default db;