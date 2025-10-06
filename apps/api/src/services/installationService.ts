import { getDb } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import { CONFIG } from '../config/index.js';

export type Installation = {
  addonId: string;
  workspaceId: string;
  installationToken?: string;
  status: string;
  settingsJson: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export const upsertInstallation = async (data: {
  addonId: string;
  workspaceId: string;
  installationToken?: string;
  status?: string;
  settingsJson?: Record<string, unknown>;
}): Promise<void> => {
  if (CONFIG.SKIP_DATABASE_CHECKS) {
    logger.debug({ addonId: data.addonId, workspaceId: data.workspaceId }, 'Skipping installation upsert because database checks are disabled');
    return;
  }

  const db = getDb();
  const client = await db.connect();
  
  try {
    const query = `
      INSERT INTO installations (addon_id, workspace_id, installation_token, status, settings_json, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (addon_id, workspace_id)
      DO UPDATE SET
        installation_token = COALESCE($3, installations.installation_token),
        status = COALESCE($4, installations.status),
        settings_json = COALESCE($5, installations.settings_json),
        updated_at = NOW()
    `;
    
    await client.query(query, [
      data.addonId,
      data.workspaceId,
      data.installationToken || null,
      data.status || 'ACTIVE',
      JSON.stringify(data.settingsJson || {})
    ]);
    
    logger.info({ 
      addonId: data.addonId, 
      workspaceId: data.workspaceId,
      status: data.status || 'ACTIVE'
    }, 'Installation upserted');
  } finally {
    client.release();
  }
};

export const getInstallation = async (addonId: string, workspaceId: string): Promise<Installation | null> => {
  if (CONFIG.SKIP_DATABASE_CHECKS) {
    logger.debug({ addonId, workspaceId }, 'Skipping installation lookup because database checks are disabled');
    return null;
  }

  const db = getDb();
  const client = await db.connect();
  
  try {
    const query = `
      SELECT addon_id, workspace_id, installation_token, status, settings_json, created_at, updated_at
      FROM installations
      WHERE addon_id = $1 AND workspace_id = $2
    `;
    
    const result = await client.query(query, [addonId, workspaceId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      addonId: row.addon_id,
      workspaceId: row.workspace_id,
      installationToken: row.installation_token,
      status: row.status,
      settingsJson: row.settings_json || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } finally {
    client.release();
  }
};

export const deleteInstallation = async (addonId: string, workspaceId: string): Promise<void> => {
  if (CONFIG.SKIP_DATABASE_CHECKS) {
    logger.debug({ addonId, workspaceId }, 'Skipping installation delete because database checks are disabled');
    return;
  }

  const db = getDb();
  const client = await db.connect();
  
  try {
    const query = `DELETE FROM installations WHERE addon_id = $1 AND workspace_id = $2`;
    const result = await client.query(query, [addonId, workspaceId]);
    
    logger.info({ 
      addonId, 
      workspaceId,
      deletedCount: result.rowCount 
    }, 'Installation deleted');
  } finally {
    client.release();
  }
};

export const getAllInstallations = async (): Promise<Installation[]> => {
  if (CONFIG.SKIP_DATABASE_CHECKS) {
    logger.debug('Skipping installation list because database checks are disabled');
    return [];
  }

  const db = getDb();
  const client = await db.connect();
  
  try {
    const query = `
      SELECT addon_id, workspace_id, installation_token, status, settings_json, created_at, updated_at
      FROM installations
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(query);
    
    return result.rows.map(row => ({
      addonId: row.addon_id,
      workspaceId: row.workspace_id,
      installationToken: row.installation_token,
      status: row.status,
      settingsJson: row.settings_json || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } finally {
    client.release();
  }
};