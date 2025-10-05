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
1. Provision managed Postgres (Render, Supabase, or RDS) and run `infra/db.sql` to seed schema.
2. Deploy the API (Render, Fly.io, or Vercel). Include the environment variables above.
3. Deploy the Vite admin UI (Vercel or Netlify). Set `VITE_API_BASE_URL` to the public API URL.
4. On first boot the API calls `/workspaces/{ws}/addons/{addonId}/webhooks` (described in `docs/https-docs-clockify-me.md`) to ensure the webhook subscription exists.

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
