/// <reference path="./@types/express/index.d.ts" />
import express, { type Request, type Response } from 'express';
import pinoHttp from 'pino-http';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './routes/index.js';
import manifestRoutes from './routes/manifest.js';
import lifecycleRoutes from './routes/lifecycle.js';
import webhookRoutes from './routes/webhooks.js';
import uiRoutes from './routes/ui.js';
import bootstrapRoutes from './routes/bootstrap.js';
import formulasRoutes from './routes/formulas.js';
import { correlationMiddleware } from './middleware/correlation.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';
import { CONFIG } from './config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawBodySaver = (req: Request, _res: Response, buf: Buffer) => {
  if (buf && req.originalUrl?.startsWith('/v1/webhooks')) {
    req.rawBody = buf.toString('utf8');
  }
};

export const createApp = (): express.Express => {
  const app = express();

  app.set('trust proxy', true);

  const allowedOrigins = CONFIG.ADMIN_UI_ORIGIN
    ? CONFIG.ADMIN_UI_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
    : undefined;

  // dev-friendly CORS: echo allowed origins and handle OPTIONS
  const ORIGINS = CONFIG.ADMIN_UI_ORIGIN
    ? CONFIG.ADMIN_UI_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  // Always allow Developer Portal for validation flows
  if (!ORIGINS.includes('https://developer.clockify.me')) {
    ORIGINS.push('https://developer.clockify.me');
  }
  const corsCfg = {
    origin: (origin: string | undefined, cb: (e: Error | null, ok?: boolean) => void) => {
      if (!origin) return cb(null, true); // curl or same-origin
      cb(null, ORIGINS.includes(origin)); // strict allow-list
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'] as string[],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] as string[]
  };
  app.use(cors(corsCfg));
  app.options('*', cors(corsCfg));

  app.use(express.json({ verify: rawBodySaver }));
  app.use(express.urlencoded({ extended: true }));
  app.use(correlationMiddleware);
  app.use(
    pinoHttp({
      logger,
      genReqId: req => req.correlationId ?? (req.headers['x-correlation-id'] as string | undefined) ?? randomUUID(),
      customProps: req => ({ correlationId: req.correlationId })
    })
  );

  const assetsPath = path.resolve(__dirname, '../../public/assets');
  app.use('/assets', express.static(assetsPath, { maxAge: '31536000', etag: true }));

  // Ensure icon is always available even if static files are not bundled
  app.get('/assets/icon.svg', (_req, res) => {
    res.type('image/svg+xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1976d2"/><stop offset="100%" stop-color="#42a5f5"/></linearGradient></defs>` +
      `<rect rx="20" ry="20" width="96" height="96" fill="url(#g)"/>` +
      `<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#ffffff">x</text>` +
      `</svg>`
    );
  });

  // Version endpoint for cache-bust verification
  app.get('/version', (req, res) => {
    res.json({
      commit: process.env.GIT_COMMIT || 'dev',
      builtAt: process.env.BUILD_TIME || new Date().toISOString(),
      baseUrl: CONFIG.BASE_URL,
      pid: process.pid
    });
  });

  // Top-level health and readiness probes (some validators expect these at root)
  app.get('/health', (_req, res) => {
    res.json({ ok: true, status: 'healthy' });
  });
  app.get('/ready', (_req, res) => {
    res.json({ ready: true });
  });

  app.get('/', (req, res) => {
    // If this is a Clockify addon request with configuration, redirect to UI
    if (req.query.auth_token) {
      return res.redirect(`/ui/sidebar?${new URLSearchParams(req.query as any).toString()}`);
    }
    res.json({ name: 'xCustom Field Expander API', version: '0.1.0' });
  });

  // Handle settings configuration URLs like /{encoded-json}
  app.get(/^\/\%7B.*/, (req, res) => {
    // This is a Clockify settings page request with encoded JSON config
    const configPath = req.path.substring(1); // Remove leading /
    // Preserve ALL query parameters, not just auth_token
    const query = new URLSearchParams(req.query as any).toString();
    res.redirect(`/ui/settings/${encodeURIComponent(configPath)}${query ? '?' + query : ''}`);
  });

  // Clockify add-on routes
  app.use('/manifest', manifestRoutes);
  app.use('/manifest.json', manifestRoutes);
  // Also expose under /api for validators that probe this path
  app.use('/api/manifest', manifestRoutes);
  app.use('/api/manifest.json', manifestRoutes);
  // And common well-known locations
  app.use('/.well-known/manifest.json', manifestRoutes);
  app.use('/.well-known/clockify/manifest.json', manifestRoutes);
  app.use('/api/lifecycle', lifecycleRoutes);
  app.use('/api', bootstrapRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/ui', uiRoutes);
  
  // API routes
  app.use('/v1', routes);
  app.use('/v1/formulas', formulasRoutes);

  // Serve static admin-ui with no-cache headers at /ui
  const adminUiPath = path.resolve(__dirname, '../../admin-ui/dist');
  app.use('/ui',
    (req, res, next) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      // Restrictive but compatible CSP for iframe UI in Clockify
      // Allow loading inside Clockify domains; scripts/styles from self; images include data URIs; connect to HTTPS for API calls
      res.set(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
          "font-src 'self' data:",
          "connect-src 'self' https:",
          "frame-ancestors 'self' https://*.clockify.me https://developer.clockify.me"
        ].join('; ')
      );
      next();
    },
    express.static(adminUiPath)
  );

  // SPA fallback for /ui routes (after static files and uiRoutes)
  app.get('/ui/*', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "frame-ancestors 'self' https://*.clockify.me https://developer.clockify.me"
      ].join('; ')
    );
    res.sendFile(path.join(adminUiPath, 'index.html'));
  });

  app.use(errorHandler);

  return app;
};

const app = createApp();

export default app;
