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
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>xCFE Settings - Ready</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #ffffff; }
          .card { color: #333; background: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h3>Settings Ready</h3>
          <p>Awaiting auth_token from Clockify host. This is normal during validation.</p>
        </div>
      </body>
      </html>
    `);
  }

  let settingsConfig = null;
  if (config) {
    try {
      // Handle double-encoded config (e.g., %257B -> %7B -> {)
      let decodedConfig = decodeURIComponent(config);

      // If still encoded, decode again
      if (decodedConfig.includes('%')) {
        try {
          decodedConfig = decodeURIComponent(decodedConfig);
        } catch (e) {
          // Already decoded, continue
        }
      }

      settingsConfig = JSON.parse(decodedConfig);
    } catch (error) {
      logger.warn({ config, error: error instanceof Error ? error.message : String(error) }, 'Failed to parse settings config');
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>xCFE Settings - Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; }
            pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="error">
            <h3>Configuration Error</h3>
            <p>Failed to parse settings configuration.</p>
            <pre>${error instanceof Error ? error.message : 'Invalid JSON format'}</pre>
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
        
        <form id="settingsForm" onsubmit="return false;">
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
            const resp = await fetch('/v1/settings?' + new URLSearchParams({ auth_token: authToken }).toString(), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(settings)
            });
            if (!resp.ok) {
              const text = await resp.text();
              throw new Error(text || ('HTTP ' + resp.status));
            }
            showStatus('Settings saved successfully!', 'success');
            if (window.parent && window.parent.postMessage) {
              window.parent.postMessage({ title: 'settingsUpdated', body: { settings } }, '*');
            }
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            showStatus('Failed to save settings: ' + msg, 'error');
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
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>xCFE - Ready</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #ffffff; }
          .card { color: #333; background: #f8f9fa; padding: 15px; border-radius: 4px; border: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h3>Addon UI Ready</h3>
          <p>Waiting for auth_token from Clockify host. This is normal during validation.</p>
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
      if (!isDev && !CONFIG.DEV_ALLOW_UNSIGNED) {
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
              <button onclick="window.top?.postMessage({title:'refreshAddonToken'}, '*')">
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

          .toast {
            position: fixed;
            top: 16px;
            right: 16px;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: none;
            animation: slideIn 0.3s ease-out;
          }

          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .toast.success {
            background: #4caf50;
            color: white;
          }

          .toast.error {
            background: #f44336;
            color: white;
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
            transition: background-color 0.2s, opacity 0.2s;
            margin-bottom: 8px;
          }

          .button:hover:not(:disabled) {
            background: #1565c0;
          }

          .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .button.secondary {
            background: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
          }

          .button.secondary:hover:not(:disabled) {
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

          /* Admin Panel Styles */
          .admin-panel {
            margin-top: 24px;
            border: 2px solid #1976d2;
            border-radius: 8px;
            overflow: hidden;
            display: none;
          }

          .admin-panel.visible {
            display: block;
          }

          .admin-header {
            background: #1976d2;
            color: white;
            padding: 12px 16px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .admin-body {
            padding: 16px;
            background: #f8f9fa;
          }

          .admin-body.collapsed {
            display: none;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 6px;
            color: #333;
          }

          .form-input, .form-select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            font-family: inherit;
          }

          .form-input:focus, .form-select:focus {
            outline: none;
            border-color: #1976d2;
          }

          .formula-row {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
            align-items: flex-end;
          }

          .formula-row .form-group {
            margin-bottom: 0;
            flex: 1;
          }

          .btn-small {
            padding: 8px 12px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
            white-space: nowrap;
          }

          .btn-small:hover {
            background: #d32f2f;
          }

          .btn-add {
            background: #4caf50;
          }

          .btn-add:hover {
            background: #388e3c;
          }

          .date-inputs {
            display: flex;
            gap: 12px;
          }

          .date-inputs .form-group {
            flex: 1;
          }

          @media (max-width: 480px) {
            body {
              padding: 12px;
            }

            .container {
              max-width: 100%;
            }

            .formula-row {
              flex-direction: column;
            }

            .date-inputs {
              flex-direction: column;
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
          
          <button id="refreshButton" class="button" onclick="refreshData()" aria-label="Refresh time entry data">
            🔄 Refresh Data
          </button>

          <button class="button secondary" onclick="refreshToken()" aria-label="Refresh authentication token">
            🔑 Refresh Token
          </button>

          <!-- Admin Panel (shown only when isAdmin=true) -->
          <div id="adminPanel" class="admin-panel">
            <div class="admin-header" onclick="toggleAdminPanel()">
              <span>⚙️ Admin: Formulas</span>
              <span id="adminToggle">▼</span>
            </div>
            <div id="adminBody" class="admin-body">
              <h4 style="margin-top: 0; margin-bottom: 16px; font-size: 14px;">Formula Configuration</h4>

              <div id="formulaList"></div>

              <button class="button btn-small btn-add" onclick="addFormulaRow()" style="width: auto; margin-bottom: 16px;">
                + Add Formula
              </button>

              <button class="button" onclick="saveFormulas()">💾 Save Formulas</button>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />

              <h4 style="margin-bottom: 16px; font-size: 14px;">Evaluate Now</h4>

              <div class="date-inputs">
                <div class="form-group">
                  <label class="form-label">Start Date</label>
                  <input type="datetime-local" id="evalStart" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">End Date</label>
                  <input type="datetime-local" id="evalEnd" class="form-input" />
                </div>
              </div>

              <button class="button" onclick="evaluateNow()">▶️ Evaluate Now</button>
            </div>
          </div>

          <div class="footer">
            xCFE v1.0.0 • Ready for formulas
          </div>
        </div>

        <div id="toast" class="toast"></div>

        <script>
          let authToken = '${authToken}';
          const backendUrl = '${backendUrl}';
          const workspaceId = '${workspaceId}';
          const userId = '${userId}';
          const isDev = ${isDev};

          function showStatus(message, type) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast ' + type;
            toast.style.display = 'block';

            setTimeout(function() {
              toast.style.display = 'none';
            }, 3000);
          }
          
          async function fetchTimeEntries() {
            const dataDiv = document.getElementById('timeEntryData');
            const refreshButton = document.getElementById('refreshButton');

            try {
              // Disable button during fetch
              if (refreshButton) refreshButton.disabled = true;
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
              dataDiv.innerHTML =
                '<div class="error">Failed to load time entries: ' + error.message + '</div>';
            } finally {
              // Re-enable button
              if (refreshButton) refreshButton.disabled = false;
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
              // Per Clockify marketplace docs: use 'title' not 'action'
              window.top.postMessage({title: 'refreshAddonToken'}, '*');
            } else {
              alert('Token refresh not available in this context');
            }
          }

          // Listen for token refresh response from Clockify
          window.addEventListener('message', function(event) {
            const { title, body } = event.data || {};

            if (title === 'addonTokenRefreshed' && body?.auth_token) {
              // Update the token
              authToken = body.auth_token;
              console.log('Token refreshed successfully');

              // Show success notification
              showStatus('Token refreshed successfully', 'success');

              // Re-fetch time entries with new token
              fetchTimeEntries();
            } else if (title === 'refreshAddonTokenFailed') {
              console.error('Token refresh failed');
              showStatus('Token refresh failed', 'error');
            }
          });

          // Admin Panel State
          let customFields = [];
          let formulas = [];

          // Check admin status and show panel
          async function checkAdmin() {
            try {
              const resp = await fetch(window.location.origin + '/v1/me?auth_token=' + encodeURIComponent(authToken));
              if (resp.ok) {
                const data = await resp.json();
                if (data.isAdmin) {
                  document.getElementById('adminPanel').classList.add('visible');
                  initAdminPanel();
                }
              }
            } catch (error) {
              console.error('Failed to check admin status:', error);
            }
          }

          async function initAdminPanel() {
            await loadCustomFields();
            await loadFormulas();
            setDefaultDateRange();
          }

          async function loadCustomFields() {
            try {
              const resp = await fetch(window.location.origin + '/v1/cf/fields?auth_token=' + encodeURIComponent(authToken));
              if (resp.ok) {
                customFields = await resp.json();
              }
            } catch (error) {
              console.error('Failed to load custom fields:', error);
            }
          }

          async function loadFormulas() {
            try {
              const resp = await fetch(window.location.origin + '/v1/settings?auth_token=' + encodeURIComponent(authToken));
              if (resp.ok) {
                const settings = await resp.json();
                formulas = settings.formulas || [];
                renderFormulaList();
              }
            } catch (error) {
              console.error('Failed to load formulas:', error);
              formulas = [];
              renderFormulaList();
            }
          }

          function renderFormulaList() {
            const container = document.getElementById('formulaList');
            if (formulas.length === 0) {
              container.innerHTML = '<p style="color: #666; font-size: 13px; margin-bottom: 12px;">No formulas configured. Click "+ Add Formula" to get started.</p>';
              return;
            }

            container.innerHTML = formulas.map((f, idx) =>
              '<div class="formula-row">' +
              '<div class="form-group">' +
              '<label class="form-label">Target CF</label>' +
              '<select class="form-select" data-idx="' + idx + '" data-field="targetId">' +
              '<option value="">Select...</option>' +
              customFields.map(cf => '<option value="' + cf.id + '"' + (cf.id === f.targetId ? ' selected' : '') + '>' + cf.name + '</option>').join('') +
              '</select>' +
              '</div>' +
              '<div class="form-group">' +
              '<label class="form-label">Expression</label>' +
              '<input type="text" class="form-input" value="' + (f.expr || '') + '" data-idx="' + idx + '" data-field="expr" />' +
              '</div>' +
              '<button class="btn-small" onclick="removeFormulaRow(' + idx + ')">✕</button>' +
              '</div>'
            ).join('');
          }

          function addFormulaRow() {
            formulas.push({ targetId: '', expr: '' });
            renderFormulaList();
          }

          function removeFormulaRow(idx) {
            formulas.splice(idx, 1);
            renderFormulaList();
          }

          async function saveFormulas() {
            // Collect current values from DOM
            const rows = document.querySelectorAll('.formula-row');
            const updated = [];
            rows.forEach((row, idx) => {
              const targetSelect = row.querySelector('[data-field="targetId"]');
              const exprInput = row.querySelector('[data-field="expr"]');
              if (targetSelect && exprInput) {
                const targetId = targetSelect.value.trim();
                const expr = exprInput.value.trim();
                // Only include formulas with both fields filled
                if (targetId && expr) {
                  updated.push({ targetId, expr });
                }
              }
            });

            try {
              const resp = await fetch(window.location.origin + '/v1/settings?auth_token=' + encodeURIComponent(authToken), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formulas: updated })
              });

              if (!resp.ok) {
                const text = await resp.text();
                throw new Error(text || 'HTTP ' + resp.status);
              }

              formulas = updated;
              showStatus('Formulas saved successfully', 'success');
            } catch (error) {
              showStatus('Failed to save formulas: ' + error.message, 'error');
            }
          }

          async function evaluateNow() {
            const startInput = document.getElementById('evalStart');
            const endInput = document.getElementById('evalEnd');

            if (!startInput.value || !endInput.value) {
              showStatus('Please select start and end dates', 'error');
              return;
            }

            const startDate = new Date(startInput.value).toISOString();
            const endDate = new Date(endInput.value).toISOString();

            try {
              const resp = await fetch(window.location.origin + '/v1/formulas/recompute?auth_token=' + encodeURIComponent(authToken), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate, endDate })
              });

              if (!resp.ok) {
                const text = await resp.text();
                throw new Error(text || 'HTTP ' + resp.status);
              }

              const result = await resp.json();
              showStatus('Evaluated: ' + result.evaluated + ', Updated: ' + result.updated, 'success');
            } catch (error) {
              showStatus('Evaluation failed: ' + error.message, 'error');
            }
          }

          function toggleAdminPanel() {
            const body = document.getElementById('adminBody');
            const toggle = document.getElementById('adminToggle');
            if (body.classList.contains('collapsed')) {
              body.classList.remove('collapsed');
              toggle.textContent = '▼';
            } else {
              body.classList.add('collapsed');
              toggle.textContent = '▶';
            }
          }

          function setDefaultDateRange() {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            // Format as datetime-local (YYYY-MM-DDTHH:MM)
            const formatDate = (d) => {
              const pad = (n) => String(n).padStart(2, '0');
              return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
            };

            document.getElementById('evalStart').value = formatDate(yesterday);
            document.getElementById('evalEnd').value = formatDate(now);
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

            // Check admin status
            checkAdmin();
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
