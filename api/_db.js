import pg from "pg";

let pool;

export function getPool() {
  if (!pool) {
    if (!process.env.POSTGRES_URL) throw new Error("Missing POSTGRES_URL");
    pool = new pg.Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}
