
import { Pool } from 'pg'
const globalForPool = global as unknown as { pgPool?: Pool }
export const pool = globalForPool.pgPool || new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  max: 5,
  idleTimeoutMillis: 10000
})
if (!globalForPool.pgPool) globalForPool.pgPool = pool
