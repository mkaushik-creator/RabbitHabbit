import dotenv from "dotenv";
dotenv.config();

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Check your .env file.",
  );
}

const isPostgres = process.env.DB_TYPE === "postgres" || process.env.DATABASE_URL.startsWith("postgres");

let db: any;
let pool: Pool | null = null;

if (isPostgres) {
  // PostgreSQL/Neon configuration
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzlePostgres(pool, { schema });
  console.log("PostgreSQL database connection established");
} else {
  // SQLite configuration
  const dbPath = process.env.DATABASE_URL.replace("file:", "");
  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });
  console.log("SQLite database connection established at:", dbPath);
}

export { db, pool };