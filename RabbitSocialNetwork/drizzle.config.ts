import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Check your .env file.");
}

const isPostgres = process.env.DB_TYPE === "postgres" || process.env.DATABASE_URL.startsWith("postgres");

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: isPostgres ? "postgresql" : "sqlite",
  dbCredentials: isPostgres
    ? { url: process.env.DATABASE_URL }
    : { url: process.env.DATABASE_URL.replace("file:", "") },
});
