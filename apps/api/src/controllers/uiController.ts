import type { RequestHandler } from 'express';
import { verifyClockifyJwt } from '../lib/jwt.js';
import { CONFIG } from '../config/index.js';
import { logger } from '../lib/logger.js';

type SettingsFieldConfig = {
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
};

type SettingsTabConfig = {
  name: string;
  description?: string;
  fields?: SettingsFieldConfig[];
};

export const renderSettings: RequestHandler = async (req, res) => {
  const authToken = req.query.auth_token as string;
  const config = req.params.config;
  
  if (!authToken) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>xCFE Settings - Error</title>
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

  let settingsConfig = null;
  if (config) {
    try {
      const decodedConfig = decodeURIComponent(config);
      settingsConfig = JSON.parse(decodedConfig);
    } catch (error) {
      console.error('Failed to parse settings config:', error);
    }
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>xCFE Settings</title>
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
          padding: 20px;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1976d2;
          margin-bottom: 8px;
        }
        
        .subtitle {
          font-size: 14px;
          color: #666;
        }
        
        .tab {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        
        .tab-header {
          background: #1976d2;
          color: white;
          padding: 15px 20px;
          font-weight: 600;
        }
        
        .tab-description {
          padding: 15px 20px;
          color: #666;
          font-size: 14px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .field {
          padding: 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .field:last-child {
          border-bottom: none;
        }
        
        .field-label {
          font-weight: 600;
          margin-bottom: 5px;
          color: #333;
        }
        
        .field-description {
          font-size: 13px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .field-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .field-input:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
        }
        
        .actions {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        
        .button {
          padding: 12px 24px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin: 0 10px;
          transition: background-color 0.2s;
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
        
        .status {
          margin-top: 20px;
          padding: 10px;
          border-radius: 4px;
          display: none;
        }
        
        .status.success {
          background: #e8f5e8;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
        }
        
        .status.error {
          background: #ffebee;
          color: #d32f2f;
          border: 1px solid #ffcdd2;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">xCFE Settings</div>
          <div class="subtitle">Configure your Custom Field Expander preferences</div>
        </div>
        
        <form id="settingsForm">
          ${settingsConfig && settingsConfig.tabs ? settingsConfig.tabs.map((tab: SettingsTabConfig) => `
            <div class="tab">
              <div class="tab-header">${tab.name}</div>
              ${tab.description ? `<div class="tab-description">${tab.description}</div>` : ''}
              ${tab.fields ? tab.fields.map((field: SettingsFieldConfig) => `
                <div class="field">
                  <div class="field-label">${field.label}</div>
                  ${field.description ? `<div class="field-description">${field.description}</div>` : ''}
                  <input 
                    type="text" 
                    class="field-input" 
                    name="${field.key}" 
                    value="${field.defaultValue || ''}"
                    ${field.required ? 'required' : ''}
                    placeholder="${field.label}"
                  />
                </div>
              `).join('') : ''}
            </div>
          `).join('') : '<div class="tab"><div class="tab-header">No Settings Available</div><div class="field">No configuration fields are currently available.</div></div>'}
        </form>
        
        <div class="actions">
          <button type="button" class="button" onclick="saveSettings()">Save Settings</button>
          <button type="button" class="button secondary" onclick="resetSettings()">Reset to Defaults</button>
        </div>
        
        <div id="status" class="status"></div>
      </div>

      <script>
        const authToken = '${authToken}';
        
        async function saveSettings() {
          const form = document.getElementById('settingsForm');
          const formData = new FormData(form);
          const settings = {};
          
          for (const [key, value] of formData.entries()) {
            settings[key] = value;
          }
          
          try {
            showStatus('Saving settings...', 'info');
            
            // Here you would typically send the settings to your API
            // For now, we'll just simulate a successful save
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showStatus('Settings saved successfully!', 'success');
            
            // In a real implementation, you might want to notify the parent window
            if (window.parent && window.parent.postMessage) {
              window.parent.postMessage({
                action: 'settingsUpdated',
                settings: settings
              }, '*');
            }
          } catch (error) {
            showStatus('Failed to save settings: ' + error.message, 'error');
          }
        }
        
        function resetSettings() {
          const form = document.getElementById('settingsForm');
          const inputs = form.querySelectorAll('input');
          
          inputs.forEach(input => {
            // Reset to default value from the field configuration
            const defaultValue = input.getAttribute('data-default') || '';
            input.value = defaultValue;
          });
          
          showStatus('Settings reset to defaults', 'info');
        }
        
        function showStatus(message, type) {
          const status = document.getElementById('status');
          status.textContent = message;
          status.className = 'status ' + type;
          status.style.display = 'block';
          
          if (type === 'success' || type === 'info') {
            setTimeout(() => {
              status.style.display = 'none';
            }, 3000);
          }
        }
      </script>
    </body>
    </html>
  `;

  res.send(html);
};

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
    // Try to parse the JWT token to get real workspace/user data
    const isDev = CONFIG.NODE_ENV === 'development';
    let claims = null;
    let backendUrl = CONFIG.CLOCKIFY_BASE_URL;
    let workspaceId = CONFIG.WORKSPACE_ID || 'dev-workspace';
    let userId = 'dev-user';

    // Always try to parse the token if available, even in dev mode
    try {
      claims = await verifyClockifyJwt(authToken, CONFIG.ADDON_KEY);
      backendUrl = claims.backendUrl || CONFIG.CLOCKIFY_BASE_URL;
      workspaceId = claims.workspaceId;
      userId = claims.userId || claims.user || 'unknown';
    } catch (error) {
      if (!isDev) {
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
              
              // Use our proxy endpoint instead of calling Clockify directly
              const url = window.location.origin + '/v1/proxy/time-entries?' + 
                'start=' + from.toISOString() + 
                '&end=' + to.toISOString() + 
                '&auth_token=' + encodeURIComponent(authToken);
              
              const response = await fetch(url, {
                headers: {
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