import { Pool } from 'pg';
import { CONFIG } from '../config/index.js';
import { logger } from './logger.js';

type PoolClient = Awaited<ReturnType<Pool['connect']>>;

let pool: Pool | undefined;
let schemaCheckPromise: Promise<void> | undefined;

const runSchemaCheck = async (db: Pool) => {
  const requiredTables = ['settings', 'formulas', 'dictionaries', 'runs'];
  const { rows } = await db.query<{ table_name: string }>(
    `SELECT table_name
       FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])`,
    [requiredTables]
  );
  const present = new Set(rows.map(row => row.table_name));
  const missing = requiredTables.filter(name => !present.has(name));
  if (missing.length) {
    logger.warn({ missing }, 'database schema missing required tables');
  }
  logger.info({ present: Array.from(present), missing }, 'database schema check complete');
};

export const getDb = (): Pool => {
  if (!pool) {
    pool = new Pool({
      connectionString: CONFIG.DATABASE_URL,
      application_name: 'xcfe-api'
    });
    pool.on('error', err => {
      logger.error({ err }, 'database pool error');
    });
    schemaCheckPromise = runSchemaCheck(pool).catch(err => {
      logger.error({ err }, 'database schema check failed');
      throw err;
    });
  }
  return pool;
};

export const ensureSchema = async () => {
  if (!schemaCheckPromise) {
    getDb();
  }
  await schemaCheckPromise;
};

export const withTransaction = async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
  const db = getDb();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
