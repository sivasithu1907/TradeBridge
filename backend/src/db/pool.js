import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Keep the pool modest for a single small VPS; tune up once there's
  // real traffic data to size against.
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {
  // A background, idle client error should never crash the whole process.
  console.error('Unexpected Postgres pool error:', err);
});

/**
 * Run a query with automatic logging of slow queries (>200ms) so
 * performance problems surface in logs before they become incidents.
 */
export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 200) {
    console.warn(`[slow query] ${duration}ms: ${text.slice(0, 120)}`);
  }
  return result;
}

/**
 * Run a set of queries inside a single transaction. Pass an async fn
 * that receives a client and does its work; commits on success,
 * rolls back on any thrown error.
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
