import type { Request, Response } from 'express';
import { z } from 'zod';
import { verifyClockifyJwt } from '../lib/jwt.js';
import { clockifyClient, RateLimitError } from '../lib/clockifyClient.js';
import { logger } from '../lib/logger.js';
import { getInstallation } from '../services/installationService.js';
import { CONFIG } from '../config/index.js';

const recomputeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  userId: z.string().optional(),
});

export const recompute = async (req: Request, res: Response) => {
  try {
    // Validate iframe JWT FIRST - 401 if missing/invalid
    if (!req.query.auth_token) {
      return res.status(401).json({ error: 'invalid_iframe_token', message: 'Missing auth_token query parameter' });
    }

    const authToken = z.string().parse(req.query.auth_token);

    // Verify JWT using verifyClockifyJwt
    const claims = await verifyClockifyJwt(authToken, process.env.ADDON_KEY!);

    // Extract claims: backendUrl, workspaceId, userId, addonId
    // Note: Clockify uses "user" field, not "userId"
    const { backendUrl, workspaceId, userId, user, addonId } = claims;
    const jwtUserId = userId || user;

    // Validate required start/end date parameters from request body
    const { startDate, endDate, userId: bodyUserId } = recomputeSchema.parse(req.body);

    // Build API base URL: backendUrl.replace(/\/$/, '') + '/v1'
    const apiBaseUrl = backendUrl.replace(/\/$/, '') + '/v1';

    // Fetch time entries from Clockify API using user-scoped endpoint
    const targetUserId = bodyUserId || jwtUserId;
    if (!targetUserId) {
      return res.status(400).json({
        error: 'User ID is required for recompute operation'
      });
    }

    logger.info({
      workspaceId,
      userId: targetUserId,
      startDate,
      endDate
    }, 'Starting formula recompute');

    // Fetch installation token from database
    const installation = await getInstallation(addonId || CONFIG.ADDON_KEY, workspaceId);
    const installationToken = installation?.installationToken;

    if (!installationToken) {
      logger.warn({ workspaceId, addonId }, 'No installation token found for workspace');
      return res.status(401).json({
        error: 'No installation found',
        message: 'Add-on not properly installed for this workspace'
      });
    }

    // Use detailed report API to fetch time entries for the specified user and date range
    const report = await clockifyClient.getDetailedReport(
      workspaceId,
      {
        dateRangeStart: startDate,
        dateRangeEnd: endDate,
        users: { ids: [targetUserId] },
        pageSize: 200,
        exportType: 'JSON'
      },
      req.correlationId,
      installationToken
    );

    const entries = report.timeEntries || [];
    let updatedCount = 0;

    // Implement minimal formula evaluation (copy duration hours to CF_CALC_HOURS_ID if set)
    const calcHoursFieldId = process.env.CF_CALC_HOURS_ID;
    
    if (calcHoursFieldId && entries.length > 0) {
      logger.info({ 
        entriesCount: entries.length, 
        calcHoursFieldId 
      }, 'Processing entries for formula evaluation');

      for (const entry of entries) {
        try {
          // Extract duration in hours from the time entry
          // Assuming the entry has a duration field in seconds
          const durationSeconds = Number(entry.duration) || 0;
          const durationHours = durationSeconds / 3600;
          
          // Update the custom field with calculated hours
          await clockifyClient.patchTimeEntryCustomFields(
            workspaceId,
            entry.id,
            {
              customFieldValues: [
                {
                  customFieldId: calcHoursFieldId,
                  value: durationHours
                }
              ]
            },
            {
              correlationId: req.correlationId
            }
          );
          
          updatedCount++;
          
          logger.debug({ 
            entryId: entry.id, 
            durationHours 
          }, 'Updated custom field for entry');
          
        } catch (error) {
          logger.error({ 
            entryId: entry.id, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }, 'Failed to update entry custom field');
        }
      }
    }

    logger.info({ 
      evaluated: entries.length, 
      updated: updatedCount 
    }, 'Formula recompute completed');

    // Return { evaluated: entries.length, updated: count }
    res.json({ 
      evaluated: entries.length, 
      updated: updatedCount,
      workspaceId,
      userId: targetUserId,
      dateRange: { startDate, endDate }
    });

  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      correlationId: req.correlationId
    }, 'Formula recompute failed');

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: error.errors
      });
    }

    if (error instanceof Error && error.message.includes('JWT verification failed')) {
      return res.status(401).json({
        error: 'Invalid authentication token'
      });
    }

    if (error instanceof RateLimitError) {
      const retryAfterSeconds = error.retryAfterMs ? Math.ceil(error.retryAfterMs / 1000) : 1;
      res.setHeader('Retry-After', retryAfterSeconds.toString());
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: error.message,
        retryAfter: retryAfterSeconds
      });
    }

    res.status(500).json({
      error: 'Internal server error during formula recompute'
    });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    // Validate iframe JWT
    if (!req.query.auth_token) {
      return res.status(401).json({ error: 'invalid_iframe_token', message: 'Missing auth_token query parameter' });
    }

    const authToken = z.string().parse(req.query.auth_token);
    const claims = await verifyClockifyJwt(authToken, process.env.ADDON_KEY!);
    const { workspaceId } = claims;

    // Validate entryId parameter
    if (!req.query.entryId) {
      return res.status(400).json({ error: 'Missing entryId query parameter' });
    }

    const entryId = z.string().parse(req.query.entryId);

    logger.info({
      workspaceId,
      entryId
    }, 'Verifying time entry custom fields');

    // Fetch time entry from Clockify API
    const entry = await clockifyClient.getTimeEntry(workspaceId, entryId, req.correlationId);

    // Return custom fields for verification
    res.json({
      entryId: entry.id,
      customFields: entry.customFieldValues || []
    });

  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      correlationId: req.correlationId
    }, 'Verify endpoint failed');

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: error.errors
      });
    }

    if (error instanceof Error && error.message.includes('JWT verification failed')) {
      return res.status(401).json({
        error: 'Invalid authentication token'
      });
    }

    res.status(500).json({
      error: 'Internal server error during verification'
    });
  }
};