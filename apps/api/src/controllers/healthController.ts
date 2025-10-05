import type { RequestHandler } from 'express';
import { CONFIG } from '../config/index.js';
import { getDb } from '../lib/db.js';
import { logger } from '../lib/logger.js';

interface DbHealth {
  reachable: boolean;
  schemaVersion?: string;
  error?: string;
}

const checkDbHealth = async (): Promise<DbHealth> => {
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

export const healthCheck: RequestHandler = async (_req, res) => {
  const dbHealth = await checkDbHealth();
  
  res.json({ 
    ok: dbHealth.reachable,
    workspaceId: CONFIG.WORKSPACE_ID, 
    timestamp: new Date().toISOString(),
    db: dbHealth
  });
};

export const readinessCheck: RequestHandler = async (_req, res) => {
  const dbHealth = await checkDbHealth();
  
  if (dbHealth.reachable) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, error: dbHealth.error });
  }
};
