import type { RequestHandler } from 'express';
import { verifyClockifyJwt } from '../lib/jwt.js';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';

export const renderSidebar: RequestHandler = async (req, res) => {
  const authToken = req.query.auth_token as string;
  
  if (!authToken) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>xCFE - Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="error">
          <h3>Authentication Error</h3>
          <p>Missing authentication token. Please refresh the page.</p>
        </div>
      </body>
      </html>
    `);
  }

  try {
    // In development, we can show a simplified UI even without token verification
    const isDev = CONFIG.NODE_ENV === 'development';
    let claims = null;
    let backendUrl = CONFIG.CLOCKIFY_BASE_URL;
    let workspaceId = CONFIG.WORKSPACE_ID || 'dev-workspace';
    let userId = 'dev-user';

    if (!isDev) {
      try {
        claims = await verifyClockifyJwt(authToken, CONFIG.ADDON_KEY);
        backendUrl = claims.backendUrl;
        workspaceId = claims.workspaceId;
        userId = claims.userId || 'unknown';
      } catch (error) {
        logger.warn({ err: error }, 'Failed to verify auth token in UI component');
        return res.status(401).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>xCFE - Authentication Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
              .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="error">
              <h3>Authentication Failed</h3>
              <p>Invalid or expired authentication token.</p>
              <button onclick="window.top?.postMessage({action:'refreshAddonToken'}, '*')">
                Refresh Token
              </button>
            </div>
          </body>
          </html>
        `);
      }
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>xCustom Field Expander</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #333;
            line-height: 1.5;
            padding: 16px;
          }
          
          .container {
            max-width: 400px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .title {
            font-size: 18px;
            font-weight: 600;
            color: #1976d2;
            margin-bottom: 4px;
          }
          
          .subtitle {
            font-size: 12px;
            color: #666;
          }
          
          .status-card {
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            background: #4caf50;
            color: white;
            margin-bottom: 12px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .info-label {
            color: #666;
            font-weight: 500;
          }
          
          .info-value {
            color: #333;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
          }
          
          .button {
            width: 100%;
            padding: 12px;
            background: #1976d2;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-bottom: 8px;
          }
          
          .button:hover {
            background: #1565c0;
          }
          
          .button.secondary {
            background: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
          }
          
          .button.secondary:hover {
            background: #eeeeee;
          }
          
          .loading {
            text-align: center;
            color: #666;
            margin: 20px 0;
          }
          
          .error {
            background: #ffebee;
            color: #d32f2f;
            padding: 12px;
            border-radius: 6px;
            font-size: 14px;
            margin-bottom: 16px;
          }
          
          .footer {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #e0e0e0;
          }
          
          @media (max-width: 480px) {
            body {
              padding: 12px;
            }
            
            .container {
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">xCustom Field Expander</div>
            <div class="subtitle">Formula automation for time entries</div>
          </div>
          
          <div class="status-card">
            <div class="status-badge">✓ Installed OK</div>
            
            <div class="info-row">
              <span class="info-label">Workspace:</span>
              <span class="info-value">${workspaceId}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">User:</span>
              <span class="info-value">${userId}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Backend:</span>
              <span class="info-value">${backendUrl}</span>
            </div>
            
            ${isDev ? '<div class="info-row"><span class="info-label">Mode:</span><span class="info-value">Development</span></div>' : ''}
          </div>
          
          <div id="timeEntryData">
            <div class="loading">Loading recent time entries...</div>
          </div>
          
          <button class="button" onclick="refreshData()">
            🔄 Refresh Data
          </button>
          
          <button class="button secondary" onclick="refreshToken()">
            🔑 Refresh Token
          </button>
          
          <div class="footer">
            xCFE v1.0.0 • Ready for formulas
          </div>
        </div>

        <script>
          const authToken = '${authToken}';
          const backendUrl = '${backendUrl}';
          const workspaceId = '${workspaceId}';
          const userId = '${userId}';
          const isDev = ${isDev};
          
          async function fetchTimeEntries() {
            try {
              const dataDiv = document.getElementById('timeEntryData');
              dataDiv.innerHTML = '<div class="loading">Loading recent time entries...</div>';
              
              // Calculate date range for last 1 day
              const to = new Date();
              const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
              
              const url = backendUrl + '/workspaces/' + workspaceId + '/time-entries?' + 
                'start=' + from.toISOString() + 
                '&end=' + to.toISOString() + 
                '&user-id=' + userId;
              
              const response = await fetch(url, {
                headers: {
                  'X-Addon-Token': authToken,
                  'Accept': 'application/json'
                }
              });
              
              if (!response.ok) {
                throw new Error('Failed to fetch: ' + response.status);
              }
              
              const data = await response.json();
              const entries = data || [];
              
              let totalDuration = 0;
              entries.forEach(entry => {
                if (entry.timeInterval?.duration) {
                  // Parse ISO 8601 duration or numeric seconds
                  const duration = typeof entry.timeInterval.duration === 'string' 
                    ? parseDuration(entry.timeInterval.duration)
                    : entry.timeInterval.duration;
                  totalDuration += duration;
                }
              });
              
              const hours = Math.floor(totalDuration / 3600);
              const minutes = Math.floor((totalDuration % 3600) / 60);
              
              dataDiv.innerHTML = 
                '<div class="status-card">' +
                '<div class="info-row">' +
                '<span class="info-label">Entries (24h):</span>' +
                '<span class="info-value">' + entries.length + '</span>' +
                '</div>' +
                '<div class="info-row">' +
                '<span class="info-label">Total Time:</span>' +
                '<span class="info-value">' + hours + 'h ' + minutes + 'm</span>' +
                '</div>' +
                '</div>';
              
            } catch (error) {
              console.error('Fetch error:', error);
              document.getElementById('timeEntryData').innerHTML = 
                '<div class="error">Failed to load time entries: ' + error.message + '</div>';
            }
          }
          
          function parseDuration(iso8601) {
            // Simple ISO 8601 duration parser for PT1H30M format
            const match = iso8601.match(/PT(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+)S)?/);
            if (!match) return 0;
            
            const hours = parseInt(match[1] || 0);
            const minutes = parseInt(match[2] || 0);
            const seconds = parseInt(match[3] || 0);
            
            return hours * 3600 + minutes * 60 + seconds;
          }
          
          function refreshData() {
            fetchTimeEntries();
          }
          
          function refreshToken() {
            if (window.top && window.top.postMessage) {
              window.top.postMessage({action: 'refreshAddonToken'}, '*');
            } else {
              alert('Token refresh not available in this context');
            }
          }
          
          // Load data on page load
          document.addEventListener('DOMContentLoaded', function() {
            if (!isDev) {
              fetchTimeEntries();
            } else {
              // Show demo data in development
              document.getElementById('timeEntryData').innerHTML = 
                '<div class="status-card">' +
                '<div class="info-row">' +
                '<span class="info-label">Entries (24h):</span>' +
                '<span class="info-value">Demo Mode</span>' +
                '</div>' +
                '<div class="info-row">' +
                '<span class="info-label">Total Time:</span>' +
                '<span class="info-value">8h 30m</span>' +
                '</div>' +
                '</div>';
            }
          });
        </script>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    logger.error({ err: error }, 'Sidebar rendering failed');
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>xCFE - Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="error">
          <h3>Internal Error</h3>
          <p>Failed to render sidebar component. Please try again.</p>
        </div>
      </body>
      </html>
    `);
  }
};