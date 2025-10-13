import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

export async function withSchema<T = any>(sql: string, params: any[] = []) {
  // ensure sbapp is first in search_path for procs/views
  await pool.query(`SET search_path = ${process.env.PGSCHEMA}, public;`);
  return pool.query<T>(sql, params);
}
