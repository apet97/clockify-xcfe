# xCustom Field Expander (xCFE)

xCustom Field Expander bridges Clockify webhooks with a formula engine that computes, validates, and writes custom field values back to time entries. It also ships an iframe-ready admin UI for managing formulas, dictionaries, dry-runs, backfills, and audit trails inside Clockify.

- Formula engine supports arithmetic, logical helpers, date utilities, and `CF("Field")` lookups.
- Validation enforces dropdown dictionaries and numeric ranges with warn/block/autofix modes.
- API delivers webhook ingestion, formula CRUD, dictionary management, backfill orchestration, and magic-link auth for the admin UI.
- Admin UI (Vite + React) is designed for Clockify iframe embedding and uses the API for secure operations.

## Prerequisites
- Node.js 20+
- pnpm 8 (`corepack enable pnpm`)
- Docker (optional, for Postgres)
- Clockify workspace ID, add-on token or API key (see `docs/https-docs-clockify-me.md` for authentication reference)

## Getting Started
1. Clone the repo and install dependencies:
   ```bash
   pnpm install
   ```
2. Copy `.env.sample` to `.env` and fill in:
   - `WORKSPACE_ID`
   - `DATABASE_URL`
   - `ENCRYPTION_KEY` (32+ chars)
   - `ADDON_TOKEN` or `API_KEY`
   - `ADDON_ID` and `WEBHOOK_PUBLIC_URL` for automatic webhook bootstrap
   - Optional `CLOCKIFY_REGION` to match EU (`euc1`), USA (`use2`), UK (`euw2`), or AU (`apse2`) API hosts referenced in the Clockify docs.
3. Launch local development (spawns Postgres via Docker, API watcher, and admin UI dev server):
   ```bash
   bash scripts/dev.sh
   ```
4. Visit the admin UI at `http://localhost:5173` and sign in with a magic link token from `POST /v1/auth/magic-link`.

## Available Commands
- `pnpm run dev` – orchestrate Postgres + API + admin UI
- `pnpm run build` – compile API and admin UI bundles
- `pnpm run test` – run Vitest suites (`tests/formulas.spec.ts`, `tests/webhook.spec.ts`)
- `pnpm run lint` – placeholder (extend with ESLint if desired)

## Database & Seeding
- Schema is defined in `infra/db.sql`.
- Run `scripts/seed-demo.sh` after configuring `.env` to populate sample formulas/dictionaries (Amount & OTFlag examples).
- Inspect audit logs via `GET /v1/runs` or the admin UI Audit tab.

## Webhooks & Formula Flow
1. Clockify delivers events like `NEW_TIME_ENTRY`, `NEW_TIMER_STARTED`, and `TIME_ENTRY_UPDATED` (see real payloads in `docs/Clockify_Webhook_JSON_Samples (1).md`).
2. `/v1/webhooks/clockify` verifies the signature (if `CLOCKIFY_WEBHOOK_SECRET` configured), fetches the latest time entry, evaluates formulas, validates results, and issues a single PATCH with updated `customFieldValues`.
3. Each run records diagnostics and diffs in the `runs` table for auditability.

## Managing Formulas
- `GET /v1/formulas` / `POST /v1/formulas` / `PUT /v1/formulas/:id` / `DELETE /v1/formulas/:id`
- Use `CF("Field")` references within expressions. Supported helpers: `ROUND`, `MIN`, `MAX`, `IF`, `AND`, `OR`, `NOT`, `IN`, `REGEXMATCH`, `DATE`, `HOUR`, `WEEKNUM`, `WEEKDAY`.
- Examples shipped via `scripts/seed-demo.sh`:
  - `Amount = ROUND(Duration.h * CF("Rate"), 2)`
  - `OTFlag = IF(Duration.h > 8, "OT", "REG")`
  - `Weekend = IF(IN(WEEKDAY(Start.tz), 6, 7), "Weekend", "Weekday")`

## Backfills & Dry Runs
- `POST /v1/backfill` accepts `{ from, to, userId?, dryRun }`.
- Dry runs preview diffs without PATCH requests; actual backfills apply updates and log results.
- Admin UI provides both CLI-free flows.

## Deployment Notes
- Update `infra/manifest.json` with production webhook/admin URLs before submitting to the marketplace.
- Respect Clockify’s 50 rps add-on rate limit; the API queues requests with jittered retries for 429 responses (implementation references `docs/https-docs-clockify-me.md`).
- Configure region-specific hosts or rate limits per the official documentation (link above) to avoid cross-region latency.

## Testing Webhooks Locally
1. Start the API (`pnpm run dev`).
2. Use `curl` to POST sample payloads (from `docs/Clockify_Webhook_JSON_Samples (1).md`) to `http://localhost:4000/v1/webhooks/clockify`.
3. Check `runs` table or `GET /v1/runs` to confirm outcomes and inspect diffs.

## Security
- Secrets stay in environment variables; `ENCRYPTION_KEY` drives AES-GCM at-rest storage and JWT signing.
- Webhook signature validation via `X-Clockify-Signature` (HMAC SHA-256) is enabled when `CLOCKIFY_WEBHOOK_SECRET` is set.
- Audit trails omit PII beyond Clockify identifiers.

## Further Reading
- [`docs/https-docs-clockify-me.md`](docs/https-docs-clockify-me.md) – Clockify API surface, auth, rate limits, and webhook requirements.
- [`docs/Clockify_Webhook_JSON_Samples (1).md`](docs/Clockify_Webhook_JSON_Samples%20(1).md) – Real webhook payloads for testing and fixture generation.
- [`docs/MARKETPLACE_LAUNCH.md`](docs/MARKETPLACE_LAUNCH.md) – Step-by-step launch plan and submission checklist.
