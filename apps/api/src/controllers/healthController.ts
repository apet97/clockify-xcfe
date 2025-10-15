import type { RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';
import { getDb } from '../lib/db.js';
import { logger } from '../lib/logger.js';

interface DbHealth {
  reachable: boolean;
  schemaVersion?: string;
  error?: string;
  skipped?: boolean;
}

const checkDbHealth = async (): Promise<DbHealth> => {
  if (CONFIG.SKIP_DATABASE_CHECKS) {
    return {
      reachable: false,
      skipped: true,
      error: 'Database checks are disabled via SKIP_DATABASE_CHECKS'
    };
  }

  try {
    const db = getDb();
    const client = await db.connect();

    try {
      // Test basic connectivity
      await client.query('SELECT 1');

      // Get schema version from migrations or a simple table count
      const { rows } = await client.query(`
        SELECT COUNT(*) as table_count
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `);

      return {
        reachable: true,
        schemaVersion: `tables:${rows[0]?.table_count || 0}`
      };
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return {
      reachable: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const manifestHealth = () => ({
  reachable: true,
  routes: ['manifest', 'lifecycle']
});

export const healthCheck: RequestHandler = async (_req, res) => {
  const dbHealth = await checkDbHealth();
  const manifest = manifestHealth();
  const runtimeOk = dbHealth.reachable || dbHealth.skipped;
  const status = runtimeOk ? 'healthy' as const : 'degraded' as const;

  res.json({
    ok: runtimeOk,
    status,
    workspaceId: CONFIG.WORKSPACE_ID,
    manifest: manifest.reachable,
    addonKey: CONFIG.ADDON_KEY,
    baseUrl: CONFIG.BASE_URL,
    timestamp: new Date().toISOString(),
    db: dbHealth,
    checks: {
      manifest,
      database: dbHealth
    }
  });
};

export const readinessCheck: RequestHandler = async (_req, res) => {
  const dbHealth = await checkDbHealth();

  if (dbHealth.reachable || dbHealth.skipped) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, error: dbHealth.error });
  }
};
