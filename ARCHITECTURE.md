# Architecture Overview

## Component Topology
- **Webhook Ingress (API `/v1/webhooks/clockify`)** — Express handler validating HMAC signatures, fetching latest time entry via `ClockifyClient`, evaluating formulas with `FormulaEngine`, patching custom fields, and writing results to `runs` audit log.
- **Formula Engine (`FormulaEngine`)** — Sandbox evaluator with whitelisted helpers (`ROUND`, `IF`, etc.), dependency sorting, dictionary validation, and security guards (regex limits, finite numbers). Consumed by webhook and backfill flows.
- **Validation & Dictionaries (`dictionaries` table + `DictionaryRule`)** — JSON-backed dictionaries controlling dropdown/numeric enforcement referenced during formula evaluation; Admin UI manages via CRUD endpoints.
- **Clockify Client (`ClockifyClient`)** — Region-aware HTTP wrapper enforcing 50 RPS via custom `RateLimiter`, adding correlation IDs, handling 429 retries, and exposing helpers for time-entry GET/PATCH, reports API, webhook management.
- **Backfill Orchestration (`runBackfill`)** — Iterates date ranges against Reports API, replays formulas in bulk, optionally applies patches, and records audit entries/outcomes. Supports dry-run vs apply.
- **Admin UI (React + Vite)** — Iframe-ready SPA using magic-link tokens. Provides views for Dashboard, Formulas, Dictionaries, Backfill, Audit Log, Settings with API proxy for time-entry previews.
- **Database (PostgreSQL)** — Stores formulas, dictionaries, installation metadata, audit runs, settings (currently partial). Seed scripts insert demo formulas/dictionaries.
- **Queues & Retries (`RateLimiter`)** — Global scheduler controlling outbound Clockify requests with jittered exponential backoff; embedded in client and backfill flows. Future work: per-workspace queues.
- **Audit Logging (`runService`, Admin UI Audit page)** — Persists run metadata (entry, status, diff, ms) for each webhook/backfill operation; UI surfaces filtering by status.

## Data Model (from `infra/db.sql`)
```
settings(workspace_id PK, region, strict_mode, backfill_months, created_at, updated_at)
formulas(id PK UUID, workspace_id, field_key, expr, priority, on_events[], created_at, updated_at)
  UNIQUE(workspace_id, field_key)
  INDEX(workspace_id, priority)
dictionaries(field_key PK, allowed_values JSONB, updated_at)
runs(id PK UUID, entry_id, user_id, ts, status, ms, diff JSONB)
  INDEX(ts DESC)
installations(addon_id, workspace_id PK, installation_token, status, settings_json, created_at, updated_at)
  INDEX(workspace_id)
  INDEX(status)
```
- **Relationships:** `formulas` and `settings` scoped by `workspace_id`; `dictionaries` global (needs workspace column). `runs` currently lacks explicit workspace link; infer via formulas or event payload. `installations` keyed by add-on/workspace pair.
- **Indexes:** `formulas_workspace_field_key_idx`, `formulas_workspace_priority_idx`, `runs_ts_idx`, `installations_workspace_idx`, `installations_status_idx`.
- **Gaps:** No FK constraints or ON DELETE actions; add for referential integrity. `runs` missing correlation ID / workspace indexes; add encryption for secret fields (installation_token).

## Request Lifecycles
### Webhook Flow (`NEW_TIME_ENTRY`, `TIME_ENTRY_UPDATED`, etc.)
1. **Ingress** — Clockify POST hits `/v1/webhooks/clockify`; Express captures raw body, correlation ID, optional addon token.
2. **Security** — `verifyClockifySignature` HMAC check (unless dev override) + addon token validation.
3. **Event Resolution** — Determine event type from header/body; reject unsupported events; short-circuit for deletions/rate updates (audit only).
4. **Fetch Latest** — Use `clockifyClient.getTimeEntry` with correlation ID to retrieve canonical entry.
5. **Load Rules** — `fetchFormulaEngineInputs` pulls workspace formulas/dictionaries into `FormulaEngine`.
6. **Evaluate** — Engine computes updates with dictionary enforcement, tracking diagnostics/warnings.
7. **Idempotency Check** — Fetch entry again; compare hashed custom fields to ensure no concurrent mutation (basic race guard).
8. **Apply Updates** — `clockifyClient.patchTimeEntryCustomFields` issues single PATCH if diff non-empty. Future: include idempotency key / ETag.
9. **Audit** — `recordRun` stores status (`success`/`skipped`/`error`), duration, diff (before/after) for UI.
10. **Response** — API returns JSON with `ok`, change count, diagnostics/warnings.

### Backfill Flow (`POST /v1/backfill`)
1. **Request Intake** — Validate payload (from/to/userId/dryRun) via Zod.
2. **Prepare Context** — Fetch formulas/dictionaries once; instantiate `FormulaEngine`.
3. **Date Iteration** — Calculate inclusive day windows; for each day page through Reports API using `clockifyClient.getDetailedReport` with retries on 429.
4. **Entry Processing** — For each entry ID, fetch full time entry, evaluate formulas, and either:
   - **Dry Run:** Record outcomes but skip PATCH/HMAC; gather differences for report.
   - **Apply:** Attempt PATCH with retries on rate limit; log via `recordRun` (status success/error).
5. **Aggregation** — Accumulate counts (scanned, updated, errors) per day; capture sample outcomes with correlation IDs.
6. **Result** — Return summary structure for UI/CLI; optionally surfaces warnings/errors.
7. **Audit** — `recordRun` invoked for applied updates and errors to maintain history.

### Admin UI Requests
- **Magic Link (`POST /v1/auth/magic-link`)** — Creates HS256 token (scoped to workspace) used by UI to authenticate subsequent API calls.
- **Proxy Time Entries (`GET /v1/proxy/time-entries`)** — Admin UI fetches recent entries via server proxy leveraging lifecycle JWT to reach Clockify backend respecting region & credentials.
- **CRUD Endpoints** — `/v1/formulas`, `/v1/dictionaries`, `/v1/backfill`, `/v1/runs`, `/v1/settings`, `/v1/sites/health` consumed by React pages using `apiRequest` helper with bearer token.

## Operational Considerations
- **Rate Limiting** — Outbound Clockify requests funneled through `RateLimiter` (global queue). Must evolve to per-workspace buckets for 50 RPS compliance and fairness.
- **Security Posture** — Secrets via env Zod validation; AES encryption utilities ready for storing installation tokens; webhook signature + JWT verification critical.
- **Observability** — Pino logger with correlation IDs; audit runs persisted for debugging. Need to extend with structured diff (old→new) and request IDs.
- **Deployment** — Docker Compose for local dev; Vercel config for serverless; manifest template + ngrok scripts aid marketplace submission.
