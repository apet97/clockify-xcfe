// Simple Express server to test addon manifest without dependencies
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Mock config for demo
const ADDON_CONFIG = {
  ADDON_KEY: 'xcfe.example',
  ADDON_NAME: 'xCustom Field Expander',
  BASE_URL: 'http://localhost:8080',
  MIN_PLAN: 'FREE'
};

// Manifest endpoint
app.get('/manifest', (req, res) => {
  const manifest = {
    key: ADDON_CONFIG.ADDON_KEY,
    name: ADDON_CONFIG.ADDON_NAME,
    baseUrl: ADDON_CONFIG.BASE_URL,
    description: "xCustom Field Expander (xCFE) automatically evaluates mathematical formulas, conditional logic, and validation rules for Clockify time entries. Configure formulas to compute amounts, categorize entries, validate data integrity, and maintain consistent custom field values across your workspace.",
    minimumPlan: ADDON_CONFIG.MIN_PLAN,
    scopes: [
      "TIME_ENTRY_READ",
      "TIME_ENTRY_WRITE", 
      "USER_READ",
      "PROJECT_READ",
      "TASK_READ",
      "CUSTOM_FIELD_READ",
      "WORKSPACE_READ"
    ],
    components: [
      {
        type: "SIDEBAR",
        access: "EVERYONE",
        path: "/ui/sidebar",
        label: "xCFE"
      }
    ],
    settings: {
      tabs: [
        {
          key: "general",
          label: "General Settings",
          description: "Configure general xCFE behavior",
          fields: [
            {
              key: "enableAutoFormulas",
              type: "TXT",
              label: "Enable Auto Formulas",
              description: "Automatically evaluate formulas on time entry changes",
              required: false,
              defaultValue: "true"
            }
          ]
        }
      ]
    },
    lifecycles: {
      installed: `${ADDON_CONFIG.BASE_URL}/lifecycle/installed`,
      statusChanged: `${ADDON_CONFIG.BASE_URL}/lifecycle/status`,
      settingsUpdated: `${ADDON_CONFIG.BASE_URL}/lifecycle/settings`,
      deleted: `${ADDON_CONFIG.BASE_URL}/lifecycle/deleted`
    },
    webhooks: []
  };

  res.json(manifest);
});

// Health endpoint
app.get('/v1/sites/health', (req, res) => {
  res.json({
    ok: true,
    manifest: true,
    addonKey: ADDON_CONFIG.ADDON_KEY,
    baseUrl: ADDON_CONFIG.BASE_URL,
    timestamp: new Date().toISOString()
  });
});

// Lifecycle endpoints (mocked)
app.post('/lifecycle/installed', (req, res) => {
  console.log('🎉 Add-on installed:', req.body);
  res.json({ success: true });
});

app.post('/lifecycle/status', (req, res) => {
  console.log('📊 Status changed:', req.body);
  res.json({ success: true });
});

app.post('/lifecycle/settings', (req, res) => {
  console.log('⚙️ Settings updated:', req.body);
  res.json({ success: true });
});

app.post('/lifecycle/deleted', (req, res) => {
  console.log('🗑️ Add-on deleted:', req.body);
  res.json({ success: true });
});

// UI sidebar
app.get('/ui/sidebar', (req, res) => {
  const authToken = req.query.auth_token || 'demo-token';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>xCustom Field Expander</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; }
        .container { max-width: 300px; margin: 0 auto; }
        .status { background: #e8f5e8; color: #2e7d32; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .info { background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
        .label { font-weight: bold; color: #666; font-size: 12px; }
        .value { font-family: monospace; color: #333; font-size: 14px; }
        .button { width: 100%; padding: 10px; background: #1976d2; color: white; border: none; border-radius: 4px; margin-top: 10px; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="status">
          <strong>✓ Installed OK</strong>
        </div>
        
        <div class="info">
          <div class="label">Token:</div>
          <div class="value">${authToken.substring(0, 20)}...</div>
        </div>
        
        <div class="info">
          <div class="label">Status:</div>
          <div class="value">Ready for formulas</div>
        </div>
        
        <button class="button" onclick="window.top?.postMessage({action:'refreshAddonToken'}, '*')">
          🔑 Refresh Token
        </button>
      </div>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'xCustom Field Expander API', 
    version: '1.0.0',
    manifest: `${ADDON_CONFIG.BASE_URL}/manifest`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 xCFE Addon Demo Server running on http://localhost:${PORT}`);
  console.log(`📋 Manifest URL: http://localhost:${PORT}/manifest`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/v1/sites/health`);
  console.log(`🎨 Sidebar Demo: http://localhost:${PORT}/ui/sidebar?auth_token=demo-token`);
  console.log('');
  console.log('Ready for Clockify Developer Portal! 🎯');
});