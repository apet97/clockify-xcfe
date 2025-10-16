# AI CLI Ops Guide

Provide this run sheet to the next automation agent. It documents the current state of the Clockify add-on deployment, available tools, and required URLs/processes.

## Project & Deployment
- Repository: `https://github.com/apet97/clockify-xcfe`
- Branch: `main`
- Vercel project: `clockify-xcfe`
- Production alias (BASE_URL): `https://clockify-xcfe-audit.vercel.app`
- Canonical .vercel.app URL: `https://clockify-xcfe-222w9lfpz-alexs-projects-a9be258a.vercel.app`
- Health endpoint: `GET https://clockify-xcfe-audit.vercel.app/health`

## Environment Variables
Set in Vercel (production/preview/development):
- `CLOCKIFY_PUBLIC_KEY_PEM` – Clockify RSA public key (if placeholder used, swap with official key before JWT checks)
- `ADMIN_UI_ORIGIN` – `https://app.clockify.me,https://*.clockify.me,https://developer.clockify.me`
- `CLOCKIFY_BASE_URL` – `https://api.clockify.me/api/v1`
- `BASE_URL` – `https://clockify-xcfe-audit.vercel.app`
- `LOG_LEVEL` – `info`
- `ENCRYPTION_KEY`, `ADMIN_SECRET` (set outside of automation; required for crypto + admin routes)

**Important:** No installation/webhook tokens stored in env. Tokens are received at runtime and cached per workspace.

## Tools / CLI Commands
Run with `pnpm run cli <command>` from repo root (`/workspace/clockify-xcfe`). Key subcommands:

### Deployment & Env
- `vercel:sync --project "clockify-xcfe" --pem-file ./public.pem [--prod-alias <url>]`
  - Syncs CLOCKIFY_PUBLIC_KEY_PEM, ADMIN_UI_ORIGIN, CLOCKIFY_BASE_URL, LOG_LEVEL, BASE_URL, and redeploys. Requires PEM via file or `--pem-env`.
- `audit:env`
  - Ensures PEM is present and no forbidden envs (`WORKSPACE_ID`, `ADDON_ID`, `INSTALL_TOKEN`, `WEBHOOK_*`). Export `CLOCKIFY_PUBLIC_KEY_PEM` locally before running if needed.
- `audit:origins`
  - Confirms `ADMIN_UI_ORIGIN` contains Clockify domains.
- `audit:logging`
  - Scans recent log files for sensitive headers.

### Installation Tracking
- `.state/install.json` created during `/api/lifecycle/installed` (no secrets; workspaceId/addonId/apiurl/hasAuthToken + timestamps).
- Commands:
  - `install:wait` — waits for `.state/install.json`; exits when INSTALLED webhook received.
  - `install:status` — prints masked summary (workspace/addon, hasAuthToken, revokedAt). Fails if not installed.
  - `install:purge` — marks state revoked (for local reset).

### JWT / Webhooks
- `jwt:webhook:verify --token <jwt> | --file <path>`
  - Decodes without signature (since PEM presence is confirmed separately) and asserts `iss=clockify`, `type=addon`, `sub=<ADDON_KEY>`.
- `jwt:ui:decode <auth_token>`
  - Dumps iframe JWT claims and expiry.
- `webhook:test:dedupe --event-file <json>`
  - Posts the same payload twice to `/v1/webhooks/clockify` with HMAC signature (requires `CLOCKIFY_WEBHOOK_SECRET` exported). First should produce changes; second returns duplicate/no-op.

### Reports / Custom Fields (placeholders)
- `report:detailed --from <ISO> --to <ISO>` — currently logs health probe. For real reports, hit server endpoints using an authenticated Bearer.
- `report:summary`, `cf:ensure`, `cf:write`, `cf:backfill` — placeholders. Use API routes or add implementation if needed.

### Reviewer Flow
- `review:script --out docs/REVIEWER_FLOW.md` writes reviewer checklist.

### CLI general usage
```
pnpm run cli --help   # prints subcommand summary
```

## Server Behavior
- Formulas/dictionaries/runs/backfill require authenticated workspace (Bearer magic-link or iframe JWT).
- Backfill service accepts ctx with workspaceId/authToken/baseUrlOverride; tokens resolved via installationService or in-memory cache.
- Webhook routes `/v1/webhooks/time-entry-*` delegate to consolidated handler; all evaluate formulas and record runs.
- Health route `/health` returns `{ ok, status, workspaceId, addonKey, baseUrl, timestamp, db }`.

## Pending Task After Install Timeout
- Receive INSTALLED lifecycle webhook to populate `.state/install.json`. Without it, `install:wait` will time out and subsequent steps (install:status, backfill, etc.) will not have token context. Trigger by reinstalling the add-on in the target workspace, then rerun:
  - `pnpm run cli install:wait`
  - `pnpm run cli install:status`

## Commands for next automation (once install webhook arrives)
1. `pnpm run cli install:status`
2. Trigger a live Clockify event — capture `clockify-signature` JWT and verify:
   - `pnpm run cli jwt:webhook:verify --file .artifacts/webhook.jwt`
3. Backfill smoke (with valid Bearer token):
```
curl -sS -X POST "$(cat .artifacts/base_url.txt)/v1/backfill" \
  -H "Authorization: Bearer <magic-link-or-iframe-token>" \
  -H "Content-Type: application/json" \
  --data '{"from":"2024-01-01","to":"2024-01-02"}'
```
4. Dedupe test:
```
export CLOCKIFY_WEBHOOK_SECRET=dev-secret
pnpm run cli webhook:test:dedupe --event-file ./fixtures/time_entry_updated.json
```
5. Verify health still 200:
```
curl -Is "$(cat .artifacts/base_url.txt)/health" | head -n1
```

## Troubleshooting Checks
- `pnpm run cli audit:env`
- `pnpm run cli audit:origins`
- `pnpm run cli audit:logging`

## Reminder: PEM
Replace the placeholder PEM (generated locally) with the official Clockify RSA public key before relying on signature verification in production.

