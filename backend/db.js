import { Pool } from "pg";

// Single shared pool for the whole app. auth.js and every route file
// import this instead of constructing their own pg.Pool.
export const pool = new Pool({
  connectionString: process.env.POSTGRESQL_URL,
});
