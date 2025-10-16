/**
 * Vercel serverless entry point
 * This file must be plain JavaScript (not TypeScript) because Vercel's
 * TypeScript compilation in the api/ directory has module resolution issues.
 *
 * It dynamically imports the pre-compiled Express app from apps/api/dist/
 */

let app;

export default async function handler(req, res) {
  if (!app) {
    // Lazy-load the compiled Express app on first request
    try {
      const appModule = await import('../apps/api/dist/app.js');
      app = appModule.default;
    } catch (error) {
      console.error('Failed to load app:', error);
      return res.status(500).json({ error: 'Failed to initialize application', details: error.message });
    }
  }

  return app(req, res);
}
