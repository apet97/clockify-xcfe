// Simple ES module addon server for testing
import { createServer } from 'node:http';
import { parse } from 'node:url';

const PORT = 8080;

// Mock config for demo
const ADDON_CONFIG = {
  ADDON_KEY: 'xcfe.example',
  ADDON_NAME: 'xCustom Field Expander',
  BASE_URL: 'http://localhost:8080',
  MIN_PLAN: 'FREE'
};

const manifest = {
  key: ADDON_CONFIG.ADDON_KEY,
  name: ADDON_CONFIG.ADDON_NAME,
  baseUrl: ADDON_CONFIG.BASE_URL,
  description: "xCustom Field Expander (xCFE) automatically evaluates mathematical formulas, conditional logic, and validation rules for Clockify time entries. Configure formulas to compute amounts, categorize entries, validate data integrity, and maintain consistent custom field values across your workspace.",
  minimalSubscriptionPlan: ADDON_CONFIG.MIN_PLAN,
  scopes: [
    "TIME_ENTRY_READ",
    "TIME_ENTRY_WRITE", 
    "USER_READ",
    "PROJECT_READ",
    "TASK_READ",
    "CUSTOM_FIELDS_READ",
    "WORKSPACE_READ"
  ],
  components: [
    {
      type: "sidebar",
      accessLevel: "EVERYONE",
      path: "/ui/sidebar",
      label: "xCFE"
    }
  ],
  settings: JSON.stringify({
    tabs: [
      {
        id: "general",
        name: "General Settings",
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
  }),
  lifecycles: {
    installed: `${ADDON_CONFIG.BASE_URL}/lifecycle/installed`,
    statusChanged: `${ADDON_CONFIG.BASE_URL}/lifecycle/status`,
    settingsUpdated: `${ADDON_CONFIG.BASE_URL}/lifecycle/settings`,
    deleted: `${ADDON_CONFIG.BASE_URL}/lifecycle/deleted`
  },
  webhooks: []
};

const server = createServer((req, res) => {
  const { pathname } = parse(req.url, true);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (pathname === '/manifest') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(manifest, null, 2));
  } else if (pathname === '/v1/sites/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      manifest: true,
      addonKey: ADDON_CONFIG.ADDON_KEY,
      baseUrl: ADDON_CONFIG.BASE_URL,
      timestamp: new Date().toISOString()
    }));
  } else if (pathname?.startsWith('/lifecycle/')) {
    console.log('🎯 Lifecycle event:', pathname, req.method);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  } else if (pathname === '/ui/sidebar') {
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="status">
            <strong>✓ Installed OK</strong>
          </div>
          <div class="info">
            <div class="label">Status:</div>
            <div class="value">Ready for formulas</div>
          </div>
        </div>
      </body>
      </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      name: 'xCustom Field Expander API', 
      version: '1.0.0',
      manifest: `${ADDON_CONFIG.BASE_URL}/manifest`
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 xCFE Addon Server running on http://localhost:${PORT}`);
  console.log(`📋 Manifest URL: http://localhost:${PORT}/manifest`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/v1/sites/health`);
  console.log('Ready for Clockify Developer Portal! 🎯');
});