# xCustom Field Expander (xCFE)

xCustom Field Expander (xCFE) keeps Clockify time-entry custom fields in sync with your business rules. Webhooks trigger a hardened formula engine that evaluates overtime multipliers, applies validations, and writes changes back through the Clockify API. An iframe-ready Admin UI lets operators manage formulas, dictionaries, backfills, and audit logs without leaving Clockify.

## Quickstart
```bash
corepack enable pnpm
pnpm install
cp .env.sample .env   # fill values from the table below
pnpm run dev          # boots Postgres (if available), API watcher, Admin UI
```
The dev script automatically skips Postgres bootstrap when the Docker daemon is unavailable. Once the servers are ready you can:
- Open the Admin UI at `http://localhost:5173`.
- Request a magic-link session token via `POST /v1/auth/magic-link`.
- POST real webhook samples to `http://localhost:8080/v1/webhooks/clockify` (see `docs/Clockify_Webhook_JSON_Samples (1).md`).

## Environment Variables
| Key | Description |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production`. Defaults to `development`. |
| `PORT` | API HTTP port (default `8080`). |
| `BASE_URL` | Public base URL used for redirects and manifest responses. |
| `WORKSPACE_ID` | Target Clockify workspace for formulas, webhooks, and audits. |
| `CLOCKIFY_BASE_URL` | Base REST endpoint, defaults to `https://api.clockify.me/api/v1`. |
| `CLOCKIFY_REGION` | Optional region code `euc1`, `use2`, `euw2`, or `apse2` to route REST + Reports APIs. |
| `ADDON_TOKEN` / `API_KEY` | Exactly one credential used for all outbound Clockify requests. |
| `ADDON_ID` | Add-on identifier used when reconciling webhooks. |
| `WEBHOOK_PUBLIC_URL` | Public URL pointing to this API (used by auto-registrar). |
| `CLOCKIFY_WEBHOOK_SECRET` | HMAC secret for verifying incoming webhooks. |
| `ENCRYPTION_KEY` | 32+ character secret used for AES-GCM at-rest storage and JWT signing. |
| `DATABASE_URL` | Postgres connection string (e.g. `postgres://postgres:postgres@localhost:5432/xcfe`). |
| `ADMIN_UI_ORIGIN` | Comma-separated list of origins allowed to call the API (iframe host). |
| `WEBHOOK_RECONCILE` | `true` to delete unknown webhooks during startup. |
| `DEV_ALLOW_UNSIGNED` | Development escape hatch to bypass webhook signatures & lifecycle JWTs. |
| `RATE_LIMIT_RPS` | Global Clockify RPS ceiling (default 50). |
| `RATE_LIMIT_MAX_BACKOFF_MS` | Cap for exponential backoff retries (default 5000). |

## Clockify Region Matrix
| Region | REST Base | Reports Base |
| --- | --- | --- |
| `use2` (USA) | `https://use2-api.clockify.me/api/v1` | `https://use2-reports.api.clockify.me/v1` |
| `euc1` (EU)  | `https://euc1-api.clockify.me/api/v1` | `https://euc1-reports.api.clockify.me/v1` |
| `euw2` (UK)  | `https://euw2-api.clockify.me/api/v1` | `https://euw2-reports.api.clockify.me/v1` |
| `apse2` (AU) | `https://apse2-api.clockify.me/api/v1` | `https://apse2-reports.api.clockify.me/v1` |
If no region is supplied the API uses the generic `CLOCKIFY_BASE_URL` and automatically derives the matching Reports host for backfill jobs.

## Commands
| Command | Purpose |
| --- | --- |
| `pnpm run dev` | Spins up Postgres (when Docker daemon is running), runs migrations, watches API + Admin UI. |
| `pnpm run build` | Builds API and Admin UI bundles. |
| `pnpm --filter @xcfe/api typecheck` | Strict TypeScript check for the API package. |
| `pnpm run test` | Executes Vitest suites for API and Admin UI. |
| `pnpm --filter @xcfe/api test -- --watch` | Focused API test loop. |
| `pnpm --filter @xcfe/admin-ui dev` | Standalone Admin UI dev server. |
| `scripts/seed-demo.sh` | Seeds Overtime demo formulas/dictionaries for the configured workspace. |

## Formula Engine & OT Rules
- Helpers: `ROUND`, `MIN`, `MAX`, `IF`, `AND`, `OR`, `NOT`, `IN`, `REGEXMATCH`, `DATE`, `HOUR`, `WEEKDAY`, `WEEKNUM`, plus `CF("Field")` lookups.
- Formulas now receive overtime metadata via `OT.*` and `Shift.*` scopes. The built-in OT summary computes:
  - Daily hour thresholds (≤10h ⇒ 1.0, 10-14 ⇒ 1.5, >14 ⇒ 2.0).
  - Second-shift bump when rest gap < 8 hours (minimum 1.5× multiplier).
  - Local-day segmentation using workspace timezone offsets.
- `scripts/seed-demo.sh` installs three default formulas:
  1. `OTMultiplier = OT.multiplier`
  2. `Amount = ROUND(Duration.h * CF("Rate") * OT.multiplier, 2)`
  3. `OTFlag = OT.flag`
  and dictionary definitions for `Rate`, `OTMultiplier`, `Amount`, and `OTFlag` (`REG`, `OT`, `DT`).

## Request Lifecycles
1. **Webhook ingest** (`POST /v1/webhooks/clockify`)
   - Validates `X-Clockify-Signature` and add-on token.
  - Fetches the live entry, computes OT summary + formulas, and diff hashes custom fields.
  - Applies a single PATCH when changes exist, using per-workspace rate limiting and fingerprinted idempotency to ignore duplicate webhooks.
  - Persists run metadata with correlation IDs, OT context, and diff snapshots.
2. **Backfill jobs** (`POST /v1/backfill`)
   - Iterates detailed report pages per-day, respecting rate limits and Retry-After headers.
   - Reuses the same OT + formula pipeline in dry-run (preview) or apply mode, recording audit entries for every mutation or failure.
3. **Admin UI**
   - Magic-link auth issues short-lived HS256 tokens (`POST /v1/auth/magic-link`).
   - SPA endpoints: `/v1/formulas`, `/v1/dictionaries`, `/v1/backfill`, `/v1/runs`, `/v1/sites/health`, `/v1/settings`, `/v1/proxy/time-entries`.

## Audit Trail
The `runs` table now stores `workspace_id`, `event`, `corrrelation_id`, `request_id`, `diff`, and fingerprints (for webhook idempotency). The Admin UI’s Audit log exposes these fields, and API consumers can page via `GET /v1/runs?limit=...`.

## Deployment Notes
- Update `infra/manifest.json` before submitting to Clockify — populate production iframe and webhook URLs.
- Respect Clockify’s 50 RPS add-on rate limit; the client enforces per-workspace throttling with jittered exponential backoff.
- Use `scripts/verify-env.sh` in CI to enforce required secrets.
- Provision Postgres with the latest `infra/db.sql` schema (includes OT run metadata indexes).

### Webhook Bootstrap (Serverless)
When running on serverless (e.g., Vercel) there is no long-lived process to auto-register webhooks on “server start”. Use the on-demand bootstrap endpoint to (re)create the required Clockify webhooks for your workspace.

Required environment variables:
- `WORKSPACE_ID` — target workspace
- `ADDON_ID` — your add-on ID from the Clockify portal
- `WEBHOOK_PUBLIC_URL` — your public API base (e.g., `https://<project>.vercel.app`)
- `ADDON_TOKEN` or `API_KEY` — outbound auth for Clockify API
- `ENCRYPTION_KEY` — also used as admin secret for this endpoint

Trigger registration (production):
```bash
curl -X POST \
  "https://<your-vercel-domain>/api/webhooks/bootstrap" \
  -H "X-Admin-Secret: $ENCRYPTION_KEY"
```
The route returns the IDs of existing/created webhooks. In development, you can also pass `Authorization: Bearer <ENCRYPTION_KEY>`.

## Troubleshooting
| Symptom | Recommended Action |
| --- | --- |
| Docker daemon not running | `scripts/dev.sh` will skip Postgres bootstrap; start Docker or supply external `DATABASE_URL`. |
| Webhooks rejected with 401 | Ensure `CLOCKIFY_WEBHOOK_SECRET` matches Clockify portal; disable via `DEV_ALLOW_UNSIGNED=true` only in dev. |
| Duplicate PATCHes logged | Review run diff fingerprint in `/v1/runs`; webhook handler caches fingerprints for 5 minutes to short-circuit retries. |
| Rate limit errors | Client auto-retries 429s. For sustained bursts consider lowering `RATE_LIMIT_RPS` or pausing upstream producers. |

## Further Reading
- [`ARCHITECTURE.md`](ARCHITECTURE.md) – component topology, OT flow diagrams, database schema.
- [`NOTES.md`](NOTES.md) – file-by-file repository notes captured during inventory.
- [`docs/https-docs-clockify-me.md`](docs/https-docs-clockify-me.md) – Clockify API digest.
- [`docs/Clockify_Webhook_JSON_Samples (1).md`](docs/Clockify_Webhook_JSON_Samples%20(1).md) – webhook fixtures used in tests.
- [`DX.md`](DX.md) – developer experience cheatsheet (commands, linting, release checklist).
