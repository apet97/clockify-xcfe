import express, { type Request, type Response } from 'express';
import { request } from 'undici';
import { ADDON_KEY, PORT, BASE_URL, getInstallation, saveInstallation } from './config.js';
import { getManifest } from './manifest.js';
import { verifyJwt } from './jwt.js';
import {
  LifecycleInstalledSchema,
  LifecycleStatusChangedSchema,
  LifecycleSettingsUpdatedSchema,
  LifecycleDeletedSchema,
  WebhookTimeEntrySchema,
  SettingsPatchSchema
} from './types.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Request logging
app.use((req, res, next) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip
  }));
  next();
});

/**
 * GET /manifest.json
 * Serves the add-on manifest
 */
app.get('/manifest.json', (req: Request, res: Response) => {
  res.json(getManifest());
});

/**
 * GET /ui/sidebar
 * Serves the sidebar HTML component
 */
app.get('/ui/sidebar', (req: Request, res: Response) => {
  res.sendFile('sidebar.html', { root: './public' });
});

/**
 * POST /lifecycle/installed
 * Called when add-on is installed to a workspace
 */
app.post('/lifecycle/installed', async (req: Request, res: Response) => {
  try {
    const lifecycleToken = req.headers['x-addon-lifecycle-token'] as string;
    if (!lifecycleToken) {
      return res.status(401).json({ error: 'Missing X-Addon-Lifecycle-Token' });
    }

    // Verify JWT
    const claims = verifyJwt(lifecycleToken, ADDON_KEY);

    // Validate payload
    const payload = LifecycleInstalledSchema.parse(req.body);

    // Save installation context
    saveInstallation({
      workspaceId: payload.workspaceId,
      userId: payload.userId,
      addonId: payload.addonId,
      installToken: lifecycleToken,
      installedAt: new Date()
    });

    console.log(JSON.stringify({
      event: 'INSTALLED',
      workspaceId: payload.workspaceId,
      userId: payload.userId,
      addonId: payload.addonId
    }));

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('INSTALLED error:', error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * POST /lifecycle/status-changed
 * Called when add-on is enabled/disabled
 */
app.post('/lifecycle/status-changed', async (req: Request, res: Response) => {
  try {
    const lifecycleToken = req.headers['x-addon-lifecycle-token'] as string;
    if (!lifecycleToken) {
      return res.status(401).json({ error: 'Missing X-Addon-Lifecycle-Token' });
    }

    verifyJwt(lifecycleToken, ADDON_KEY);
    const payload = LifecycleStatusChangedSchema.parse(req.body);

    console.log(JSON.stringify({
      event: 'STATUS_CHANGED',
      workspaceId: payload.workspaceId,
      status: payload.status
    }));

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('STATUS_CHANGED error:', error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * POST /lifecycle/settings-updated
 * Called when workspace admin saves settings
 */
app.post('/lifecycle/settings-updated', async (req: Request, res: Response) => {
  try {
    const lifecycleToken = req.headers['x-addon-lifecycle-token'] as string;
    if (!lifecycleToken) {
      return res.status(401).json({ error: 'Missing X-Addon-Lifecycle-Token' });
    }

    verifyJwt(lifecycleToken, ADDON_KEY);
    const payload = LifecycleSettingsUpdatedSchema.parse(req.body);

    console.log(JSON.stringify({
      event: 'SETTINGS_UPDATED',
      workspaceId: payload.workspaceId,
      settings: payload.settings
    }));

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('SETTINGS_UPDATED error:', error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * POST /lifecycle/deleted
 * Called when add-on is uninstalled
 */
app.post('/lifecycle/deleted', async (req: Request, res: Response) => {
  try {
    const lifecycleToken = req.headers['x-addon-lifecycle-token'] as string;
    if (!lifecycleToken) {
      return res.status(401).json({ error: 'Missing X-Addon-Lifecycle-Token' });
    }

    verifyJwt(lifecycleToken, ADDON_KEY);
    const payload = LifecycleDeletedSchema.parse(req.body);

    console.log(JSON.stringify({
      event: 'DELETED',
      workspaceId: payload.workspaceId
    }));

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('DELETED error:', error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * GET /addon/settings
 * Proxy to Clockify settings API
 */
app.get('/addon/settings', async (req: Request, res: Response) => {
  try {
    const authToken = req.query.auth_token as string;
    if (!authToken) {
      return res.status(401).json({ error: 'Missing auth_token' });
    }

    const claims = verifyJwt(authToken, ADDON_KEY);
    const installation = getInstallation(claims.workspaceId);
    if (!installation) {
      return res.status(404).json({ error: 'Installation not found' });
    }

    const settingsUrl = `${claims.backendUrl}/addon/workspaces/${claims.workspaceId}/settings`;
    const response = await request(settingsUrl, {
      method: 'GET',
      headers: {
        'X-Addon-Token': installation.installToken
      }
    });

    const data = await response.body.json();
    res.json(data);
  } catch (error) {
    console.error('GET /addon/settings error:', error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * PATCH /addon/settings
 * Proxy to Clockify settings API
 */
app.patch('/addon/settings', async (req: Request, res: Response) => {
  try {
    const authToken = req.query.auth_token as string;
    if (!authToken) {
      return res.status(401).json({ error: 'Missing auth_token' });
    }

    const claims = verifyJwt(authToken, ADDON_KEY);
    const installation = getInstallation(claims.workspaceId);
    if (!installation) {
      return res.status(404).json({ error: 'Installation not found' });
    }

    // Validate settings payload
    const settings = SettingsPatchSchema.parse(req.body);

    const settingsUrl = `${claims.backendUrl}/addon/workspaces/${claims.workspaceId}/settings`;
    const response = await request(settingsUrl, {
      method: 'PATCH',
      headers: {
        'X-Addon-Token': installation.installToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });

    const data = await response.body.json();
    res.json(data);
  } catch (error) {
    console.error('PATCH /addon/settings error:', error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * POST /webhooks/time-entry
 * Receives TIME_ENTRY_UPDATED and NEW_TIME_ENTRY webhooks
 */
app.post('/webhooks/time-entry', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['clockify-signature'] as string;
    const eventType = req.headers['clockify-webhook-event-type'] as string;

    if (!signature) {
      return res.status(401).json({ error: 'Missing clockify-signature' });
    }

    if (!eventType) {
      return res.status(400).json({ error: 'Missing clockify-webhook-event-type' });
    }

    // Verify webhook signature
    verifyJwt(signature, ADDON_KEY);

    // Validate event type
    const allowedEvents = ['TIME_ENTRY_UPDATED', 'NEW_TIME_ENTRY'];
    if (!allowedEvents.includes(eventType)) {
      return res.status(400).json({ error: `Unexpected event type: ${eventType}` });
    }

    // Validate payload
    const payload = WebhookTimeEntrySchema.parse(req.body);

    console.log(JSON.stringify({
      event: eventType,
      workspaceId: payload.workspaceId,
      userId: payload.userId,
      timeEntryId: payload.timeEntryId,
      start: payload.start,
      end: payload.end
    }));

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: String(error) });
  }
});

/**
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(JSON.stringify({
    status: 'Server started',
    port: PORT,
    baseUrl: BASE_URL,
    manifestUrl: `${BASE_URL}/manifest.json`,
    sidebarUrl: `${BASE_URL}/ui/sidebar`,
    addonKey: ADDON_KEY
  }));
});
