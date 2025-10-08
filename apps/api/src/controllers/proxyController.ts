import type { RequestHandler } from 'express';
import { verifyClockifyJwt } from '../lib/jwt.js';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';

export const proxyTimeEntries: RequestHandler = async (req, res) => {
  const authToken = req.query.auth_token as string;
  
  if (!authToken) {
    return res.status(400).json({ error: 'Missing auth token' });
  }

  try {
    // Parse the JWT token to get workspace and user info
    const claims = await verifyClockifyJwt(authToken, CONFIG.ADDON_KEY);
    const backendUrl = claims.backendUrl || CONFIG.CLOCKIFY_BASE_URL;
    const workspaceId = claims.workspaceId;
    const userId = claims.userId ?? claims.user ?? undefined;

    // Extract query parameters
    const start = req.query.start as string;
    const end = req.query.end as string;

    if (!start || !end) {
      return res.status(400).json({ error: 'Missing start or end parameters' });
    }

    if (!userId) {
      logger.warn({ workspaceId, claimsKeys: Object.keys(claims) }, 'Missing user claim on Clockify JWT');
      return res.status(400).json({ error: 'Missing user information in auth token' });
    }

    // Build the Clockify API URL safely to avoid malformed query strings
    const clockifyUrl = new URL(`/v1/workspaces/${workspaceId}/time-entries`, backendUrl);
    clockifyUrl.searchParams.set('start', start);
    clockifyUrl.searchParams.set('end', end);
    clockifyUrl.searchParams.set('user-id', userId);

    // Make the request to Clockify API
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'xCFE/1.0.0'
    };

    if (CONFIG.ADDON_TOKEN) {
      headers['X-Addon-Token'] = CONFIG.ADDON_TOKEN;
    } else if (CONFIG.API_KEY) {
      headers['X-Api-Key'] = CONFIG.API_KEY;
    } else {
      logger.error('Clockify credentials not configured for proxy request');
      return res.status(500).json({ error: 'Clockify credentials not configured on server' });
    }

    const response = await fetch(clockifyUrl, {
      headers
    });

    if (!response.ok) {
      logger.warn({ 
        status: response.status, 
        statusText: response.statusText,
        url: clockifyUrl.toString() 
      }, 'Clockify API request failed');
      
      return res.status(response.status).json({ 
        error: `Clockify API error: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    logger.error({ err: error }, 'Proxy request failed');
    res.status(500).json({ error: 'Internal server error' });
  }
};
