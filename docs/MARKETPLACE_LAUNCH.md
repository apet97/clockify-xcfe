# xCustom Field Expander Marketplace Launch Guide

## Prerequisites
- Create the add-on entry in the Clockify Marketplace dashboard.
- Request an Add-on token and optional API key (see `docs/https-docs-clockify-me.md` for authentication headers).
- Identify the workspace region and align `CLOCKIFY_BASE_URL`:
  - EU: `https://euc1-api.clockify.me/api/v1`
  - USA: `https://use2-api.clockify.me/api/v1`
  - UK: `https://euw2-api.clockify.me/api/v1`
  - AU: `https://apse2-api.clockify.me/api/v1`

## Environment Configuration
1. Clone the repository and copy `.env.sample` to `.env`.
2. Populate required variables:
   - `WORKSPACE_ID`
   - `DATABASE_URL`
   - `ENCRYPTION_KEY` (32+ characters)
   - `ADDON_TOKEN` or `API_KEY`
   - `WEBHOOK_PUBLIC_URL` and `ADDON_ID` for webhook bootstrap
   - Optional: `CLOCKIFY_REGION` to override the base URL
3. Run `scripts/verify-env.sh` to confirm configuration.
4. Start local services with `scripts/dev.sh` (Postgres via Docker, API watcher, Vite admin UI).

## Deployment Workflow

### Option A: Render Deployment
1. **Database**: Create PostgreSQL instance on Render
   ```bash
   # Run migrations after database is ready
   psql $DATABASE_URL -f infra/db.sql
   ```

2. **API Service**: Create new Web Service on Render
   - Build Command: `pnpm install && pnpm --filter @xcfe/api build`
   - Start Command: `pnpm --filter @xcfe/api start`
   - Environment Variables: Copy from `.env.sample`

3. **Admin UI**: Create Static Site on Render
   - Build Command: `pnpm install && pnpm --filter @xcfe/admin-ui build`
   - Publish Directory: `apps/admin-ui/dist`
   - Environment Variable: `VITE_API_BASE_URL=https://your-api.onrender.com/v1`

### Option B: Vercel Deployment
1. **Database**: Use Vercel Postgres or external provider
2. **API**: Deploy to Vercel Functions
   - Configure `vercel.json` for API routes
   - Set environment variables in Vercel dashboard
3. **Admin UI**: Deploy as Vercel frontend
   - Auto-deploys from `/apps/admin-ui`
   - Set `VITE_API_BASE_URL` environment variable

### Webhook Registration
On first boot, the API automatically calls Clockify's webhook management endpoint to ensure subscription exists:
`POST /workspaces/{workspaceId}/addons/{addonId}/webhooks`

## QA Plan
1. Seed demo rules with `scripts/seed-demo.sh`.
2. Post sample webhook payloads from `docs/Clockify_Webhook_JSON_Samples (1).md` to the local `/v1/webhooks/clockify` endpoint.
3. Verify audit entries via `/v1/runs` and confirm custom field updates using the Clockify UI or API (`PATCH /workspaces/{ws}/time-entries/{id}` references).
4. Run `pnpm run test` to execute formula and webhook unit tests.
5. For bulk validation, trigger a dry-run backfill from the admin UI and inspect the summary.

## Submission Checklist
- [ ] Privacy notice and PII handling documented in README.
- [ ] Data retention policy aligned with Clockify guidelines.
- [ ] Support email (`support@example.com`) monitored; SLA ≤ 24 hours.
- [ ] Webhook endpoint reachable and returning 200 responses within rate limits (50 rps with retry per `docs/https-docs-clockify-me.md`).
- [ ] Admin UI iframe link and webhook URL added to `infra/manifest.json` before submission.
