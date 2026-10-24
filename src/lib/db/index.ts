import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { parseEnv } from "@neon/env";
import neonConfig from "../../../neon";
import * as schema from "./schema";

// Ensure global singleton connection in development to prevent connection exhaustion
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

function getDatabaseUrl(): string {
  try {
    const { postgres: pgEnv } = parseEnv(neonConfig, ["DATABASE_URL"]);
    if (pgEnv?.databaseUrl) {
      return pgEnv.databaseUrl;
    }
  } catch {
    // Fallback to direct process.env check if not injected through parseEnv
  }
  return (
    process.env.DATABASE_URL ||
    "postgresql://earth_user:earth_password@localhost:5432/earth_db"
  );
}

const connectionString = getDatabaseUrl();

export const client =
  globalForDb.conn ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
export { schema };
