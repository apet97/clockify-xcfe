# Repository Notes

## Root Configuration
- **package.json** — Purpose: workspace manifest orchestrating scripts; Key exports: scripts (`dev`, `dev:addon`, `dev:api`, `build`, `test`, `lint`, `fmt`, `fmt:check`, `typecheck`); Cross-refs: `scripts/dev.sh`, pnpm workspace packages; TODOs/Risks: Lint/fmt scripts require config alignment; ensure contributors use Node ≥20.
- **pnpm-workspace.yaml** — Purpose: declares workspace package globs; Key exports: includes `apps/*`, `scripts`, `tests`; Cross-refs: per-package `package.json`; TODOs/Risks: none.
- **tsconfig.base.json** — Purpose: shared TS compiler options with strict mode and path aliases; Key exports: alias `@api/*`, `@admin-ui/*`, `@tests/*`; Cross-refs: package tsconfigs, Vitest; TODOs/Risks: `moduleResolution: bundler` requires compatible tooling.
- **tsconfig.json** — Purpose: solution-style config referencing API/UI; Key exports: project references; Cross-refs: `pnpm -r typecheck`; TODOs/Risks: none.
- **vitest.config.ts** — Purpose: global Vitest config; Key exports: alias resolver, `tests/setup.ts`, node environment; Cross-refs: backend unit tests; TODOs/Risks: UI tests rely on local config (currently minimal).
- **README.md** — Purpose: top-level product overview and quickstart; Key exports: setup steps, formula helper list; Cross-refs: docs, scripts; TODOs/Risks: update after OT work, include new envs/screenshots.
- **FINDINGS.md** — Purpose: historical gap analysis; Key exports: summarized fixes/security recommendations; Cross-refs: rate limiter, webhook security; TODOs/Risks: some statements outdated (git now present), treat as legacy reference.
- **MARKETPLACE_LAUNCH.md** — Purpose: developer install walkthrough; Key exports: `.env` sample, ngrok workflow; Cross-refs: `simple-addon.mjs`, `ngrok.yml`; TODOs/Risks: Mentions SQLite though repo uses Postgres—clarify.

## Documentation
- **docs/https-docs-clockify-me.md** — Purpose: referenced Clockify API compendium; Key exports: endpoint listings, rate limits; Cross-refs: `clockifyClient` region mapping; TODOs/Risks: huge static file—monitor for drift.
- **docs/Clockify_Webhook_JSON_Samples (1).md** — Purpose: webhook fixtures; Key exports: JSON payloads used in tests; Cross-refs: `tests/webhook.spec.ts`; TODOs/Risks: add OT-specific payloads, ensure sanitized.
- **docs/MARKETPLACE_LAUNCH.md** — Purpose: marketplace launch checklist; Key exports: env requirements, QA plan; Cross-refs: `infra/manifest.json`, scripts; TODOs/Risks: keep in sync with MARKETPLACE_CHECKLIST deliverable.
- **CLOCKIFY_DETAILED_REPORT_API_COMPLETE_GUIDE.md** — Purpose: internal guide for Reports API; Key exports: sample requests, pagination tips; Cross-refs: `clockifyClient.getDetailedReport`, backfill service; TODOs/Risks: update if API contract changes.

## Orchestration & Scripts
- **docker-compose.yml** — Purpose: local Postgres (with Adminer) bootstrap; Key exports: mounts `infra/db.sql`; Cross-refs: `scripts/dev.sh`; TODOs/Risks: add healthchecks, align DB creds with scripts.
- **scripts/dev.sh** — Purpose: main dev launcher (docker compose, `pnpm install`, migrations, parallel dev); Key exports: ensures `DATABASE_URL`; Cross-refs: `scripts/migrate.sh`; TODOs/Risks: unconditional `pnpm install` slows workflows; add readiness wait.
- **scripts/dev-addon.sh** — Purpose: add-on oriented dev runner with optional ngrok; Key exports: builds API, exposes manifest; Cross-refs: `scripts/migrate.sh`, `ngrok.yml`; TODOs/Risks: running `pnpm install` every run; ensure cleanup handles backgrounds.
- **scripts/dev-db.sh** — Purpose: quick DB bootstrap; Key exports: `docker compose up`, runs migrations; Cross-refs: docker-compose; TODOs/Risks: default `DATABASE_URL` mismatches compose credentials (`xcfe` user); reconcile.
- **scripts/migrate.sh** — Purpose: apply schema via `psql` and `infra/db.sql`; Key exports: requires `DATABASE_URL`; Cross-refs: all setup scripts; TODOs/Risks: no migration history; re-running re-applies DDL blindly.
- **scripts/push-sample-webhook.sh** — Purpose: send sample webhook payload with optional signature; Key exports: CLI flags, HMAC generation; Cross-refs: `/v1/webhooks/clockify`; TODOs/Risks: references `docs/sample-webhook.json` (missing)—add fixture.
- **scripts/run-dryrun-24h.sh** — Purpose: 24h dry-run helper; Key exports: auto date calc, jq summaries; Cross-refs: `/v1/backfill`; TODOs/Risks: relies on API token, consider batching output to file.
- **scripts/run-qa-suite.sh** — Purpose: end-to-end QA script combining automated checks + manual prompts; Key exports: runs typecheck/test/build, API health checks; Cross-refs: `pnpm` scripts; TODOs/Risks: Some steps placeholders (performance tests) — expand; ensure idempotent.
- **scripts/seed-demo.sh** — Purpose: seed formulas/dictionaries for demo workspace; Key exports: inserts Amount & OTFlag; Cross-refs: Postgres `formulas`, `dictionaries`; TODOs/Risks: update to include OTMultiplier, Amount, OTFlag dictionaries once new rules built.
- **scripts/verify-env.sh** — Purpose: minimal env validation; Key exports: checks `DATABASE_URL`, `WORKSPACE_ID`, `ENCRYPTION_KEY`, ensures `ADDON_TOKEN` or `API_KEY`; Cross-refs: `.env`; TODOs/Risks: expand coverage (region, webhook secret) for production.

## Infrastructure
- **infra/db.sql** — Purpose: DB schema (settings, formulas, dictionaries, runs, installations); Key exports: indexes on formulas/runs/installations; Cross-refs: services; TODOs/Risks: `runs` lacks workspace & correlation ID; add encryption for sensitive fields.
- **infra/manifest.json** — Purpose: Clockify marketplace manifest template; Key exports: scopes, webhook/admin URLs; Cross-refs: docs; TODOs/Risks: Contains stale ngrok URLs; will replace with prod endpoints.
- **infra/vercel.json** — Purpose: Vercel routing config for API; Key exports: routes all traffic to server entry; Cross-refs: deployment Option B; TODOs/Risks: ensure build pipeline generates compiled output for Node handler.

## API Package Configs
- **apps/api/package.json** — Purpose: API package manifest; Key exports: scripts (`dev`, `build`, `start`, `typecheck`, `lint`, `test`), dependencies (express, pg, jose, pino, zod); Cross-refs: `tsx` dev server, Vitest; TODOs/Risks: `test` script runs from repo root—document expectation.
- **apps/api/tsconfig.json**, **apps/api/tsconfig.build.json** — Purpose: compiler settings with incremental builds & declarations; Cross-refs: build pipeline; TODOs/Risks: none.

## API Application
- **apps/api/src/app.ts** — Purpose: Express app factory configuring CORS, body parsing (raw capture), correlation middleware, route mounting; Key exports: `createApp`; Cross-refs: `CONFIG.ADMIN_UI_ORIGIN`, `routes/index.ts`; TODOs/Risks: JSON body size unlimited; add limit & security headers.
- **apps/api/src/server.ts** — Purpose: HTTP server bootstrap; Key exports: `start`; Cross-refs: `ensureSchema`, `ensureWebhooks` placeholder; TODOs/Risks: Webhook registration commented out; reinstate with retries and logging.
- **apps/api/src/config/env.ts** — Purpose: Zod-based env validation; Key exports: `CONFIG`, `Env`; Cross-refs: all components; TODOs/Risks: `RSA_PUBLIC_KEY_PEM` trimmed to '' allowed only with DEV flag; ensure secrets rotations documented.
- **apps/api/src/lib/logger.ts** — Purpose: Pino logger with header redaction; Key exports: `logger`; Cross-refs: controllers, middleware; TODOs/Risks: Provide pretty transport option for dev.
- **apps/api/src/lib/db.ts** — Purpose: Postgres pool manager, schema check, transaction helper; Key exports: `getDb`, `ensureSchema`, `withTransaction`; Cross-refs: services; TODOs/Risks: Schema check only logs missing tables; add fail-fast in prod; ensure graceful shutdown.
- **apps/api/src/lib/encryption.ts** — Purpose: AES-256-GCM utilities deriving key from `ENCRYPTION_KEY`; Key exports: `encrypt`, `decrypt`; Cross-refs: `installationService` (future); TODOs/Risks: Same key used for JWT; consider separation.
- **apps/api/src/lib/jwt.ts** — Purpose: Issue HS256 magic-link tokens & verify RS256 Clockify lifecycle tokens; Key exports: `issueMagicLink`, `verifyMagicLink`, `verifyClockifyJwt`; Cross-refs: auth, lifecycle, proxy, UI controllers; TODOs/Risks: Need token revocation/expiry strategies.
- **apps/api/src/lib/rateLimiter.ts** — Purpose: Global rate limiter with jittered exponential backoff; Key exports: `RateLimiter`, singleton `rateLimiter`; Cross-refs: `clockifyClient`, webhook registrar; TODOs/Risks: Single queue for all workspaces—spec calls for per-workspace queue & 50 RPS compliance.
- **apps/api/src/lib/clockifyClient.ts** — Purpose: Typed Clockify client (region aware) with rate-limit handling; Key exports: `clockifyClient`, `ClockifyClient`, `ClockifyHttpError`, `RateLimitError`; Cross-refs: webhook/backfill/registrar; TODOs/Risks: `getDetailedReport` host derivation via string replace brittle; add idempotency/patched diff support.
- **apps/api/src/lib/formulaEngine.ts** — Purpose: Secure expression evaluator with dictionary enforcement & helpers; Key exports: `FormulaEngine`, dictionary/formula types, `extractDependencies`; Cross-refs: webhook/backfill services, tests; TODOs/Risks: Add OT helper functions and rest-gap logic; consider caching parsed ASTs.
- **apps/api/src/lib/webhookSecurity.ts** — Purpose: Verify HMAC signature using timing-safe compare; Key exports: `verifyClockifySignature`; Cross-refs: webhook controller; TODOs/Risks: Ensure raw body stored for replays; consider logging failures.
- **apps/api/src/middleware/correlation.ts** — Purpose: Attach correlation IDs to requests/responses; Key exports: `correlationMiddleware`; Cross-refs: logger; TODOs/Risks: None.
- **apps/api/src/middleware/errorHandler.ts** — Purpose: Global error serialization with Zod support; Key exports: `errorHandler`; Cross-refs: `app.ts`; TODOs/Risks: Provide sanitized stack logs only in dev.
- **apps/api/src/types/clockify.ts** — Purpose: Zod schemas/types for time entries and events; Key exports: `clockifyTimeEntrySchema`, `ClockifyWebhookEvent`, etc.; Cross-refs: services, controllers, tests; TODOs/Risks: Expand to cover additional webhook payload fields (custom field metadata) needed for OT.
- **apps/api/src/controllers/authController.ts** — Purpose: `POST /v1/auth/magic-link`; Key exports: `createMagicLink`; Cross-refs: `issueMagicLink`; TODOs/Risks: Add auth throttling/logging.
- **apps/api/src/controllers/backfillController.ts** — Purpose: Validate backfill payload & invoke service; Key exports: `executeBackfill`; Cross-refs: `runBackfill`; TODOs/Risks: Add auth/role checks, correlation logging.
- **apps/api/src/controllers/formulaController.ts** — Purpose: CRUD endpoints for formulas/dictionaries; Key exports: `getFormulas`, `postFormula`, `putFormula`, `removeFormula`, `getDictionaries`, `upsertDictionaryHandler`, `removeDictionaryHandler`; Cross-refs: `formulaService`; TODOs/Risks: No auth/rate limit; ensure onEvents validated.
- **apps/api/src/controllers/healthController.ts** — Purpose: Health/readiness checks including DB ping; Key exports: `healthCheck`, `readinessCheck`; Cross-refs: Admin UI Dashboard; TODOs/Risks: `SKIP_DATABASE_CHECKS` returns `reachable:false`; adjust messaging.
- **apps/api/src/controllers/lifecycleController.ts** — Purpose: Handle marketplace lifecycle events, verify JWT, persist installations; Key exports: `handleInstalled`, `handleStatusChanged`, `handleSettingsUpdated`, `handleDeleted`; Cross-refs: `verifyClockifyJwt`, `installationService`; TODOs/Risks: Store tokens encrypted, handle failure retries.
- **apps/api/src/controllers/manifestController.ts** — Purpose: Serve manifest JSON from env; Key exports: `getManifest`; Cross-refs: marketplace manifest; TODOs/Risks: align minimal plan, features with infra manifest.
- **apps/api/src/controllers/proxyController.ts** — Purpose: Proxy time-entry fetch for iframe (auth token + region awareness); Key exports: `proxyTimeEntries`; Cross-refs: `verifyClockifyJwt`, `CONFIG` tokens; TODOs/Risks: Accepts auth token via query; enforce rate limits and error handling for 4xx.
- **apps/api/src/controllers/runController.ts** — Purpose: List audit runs; Key exports: `getRuns`; Cross-refs: `runService`; TODOs/Risks: Add filters (status, dates) and pagination.
- **apps/api/src/controllers/settingsController.ts** — Purpose: In-memory settings; Key exports: `getSettings`, `updateSettings`; Cross-refs: Admin UI Settings; TODOs/Risks: Data not persisted; integrate DB persistence.
- **apps/api/src/controllers/uiController.ts** — Purpose: Render HTML for sidebar/settings; Key exports: `renderSidebar`, `renderSettings`; Cross-refs: `verifyClockifyJwt`; TODOs/Risks: Inline HTML large; add templating & better error states.
- **apps/api/src/controllers/webhookController.ts** — Purpose: Main Clockify webhook pipeline (signature check, fetch, formula eval, patch, audit); Key exports: `clockifyWebhookHandler`; Cross-refs: `FormulaEngine`, `clockifyClient`, `runService`; TODOs/Risks: Needs idempotency persistence, per-workspace queue, OT updates.
- **apps/api/src/routes/index.ts** and sub-routes (`health.ts`, `webhooks.ts`, `formulas.ts`, `dictionaries.ts`, `backfill.ts`, `auth.ts`, `runs.ts`, `settings.ts`, `lifecycle.ts`, `manifest.ts`, `ui.ts`, `proxy.ts`) — Purpose: Express routers wiring controllers under `/v1` and others; Key exports: route definitions; Cross-refs: controllers; TODOs/Risks: Add auth middleware & versioned namespace enforcement.
- **apps/api/src/services/backfillService.ts** — Purpose: Detailed report ingestion, formula evaluation, optional patching with retries; Key exports: `runBackfill`, `BackfillResult`; Cross-refs: `clockifyClient`, `FormulaEngine`, `recordRun`; TODOs/Risks: Implement rest-gap logic, per-workspace throttling, capture correlation IDs in DB.
- **apps/api/src/services/formulaService.ts** — Purpose: DB access for formulas/dictionaries & aggregator for engine; Key exports: CRUD functions, `fetchFormulaEngineInputs`; Cross-refs: controllers, webhook/backfill; TODOs/Risks: Dictionaries not workspace-scoped; ensure JSON schema validation.
- **apps/api/src/services/runService.ts** — Purpose: Persist & retrieve run history; Key exports: `recordRun`, `listRecentRuns`; Cross-refs: audit UI; TODOs/Risks: Add workspaceId, correlationId columns & indexes.
- **apps/api/src/services/webhookRegistrar.ts** — Purpose: Ensure required Clockify webhooks exist, handle reconciliation; Key exports: `ensureWebhooks`; Cross-refs: `clockifyClient`; TODOs/Risks: `ensureWebhooks` currently unused during start; integrate with queue & handle duplicates.
- **apps/api/src/services/installationService.ts** — Purpose: Manage installations persistence; Key exports: `upsertInstallation`, `getInstallation`, `deleteInstallation`, `getAllInstallations`; Cross-refs: lifecycle controller; TODOs/Risks: Store secrets encrypted; add error handling when DB unavailable.
- **apps/api/src/@types/express/index.d.ts** — Purpose: Extend Express Request with `rawBody`, `correlationId`; Key exports: type augmentation; Cross-refs: controllers/middleware; TODOs/Risks: none.

## Admin UI Package Configs
- **apps/admin-ui/package.json** — Purpose: Admin UI manifest; Key exports: scripts (`dev`, `build`, `preview`, `test`, `typecheck`, `lint`), dependencies (React, React Query, Router, Zod); Cross-refs: Vite config; TODOs/Risks: Provide ESLint config or adjust script.
- **apps/admin-ui/tsconfig.json**, **tsconfig.node.json** — Purpose: UI TypeScript settings (React JSX, vite types, node config); Cross-refs: Vite build/test; TODOs/Risks: None.
- **apps/admin-ui/vite.config.ts** — Purpose: Vite setup with React plugin and host allowances; Key exports: dev server config (5173, ngrok hosts); Cross-refs: dev workflow; TODOs/Risks: Hard-coded ngrok host; externalize to env.

## Admin UI Application
- **apps/admin-ui/index.html** — Purpose: Vite entry HTML; Key exports: root `div#root`; TODOs/Risks: ensure iframe meta tags for Clockify.
- **apps/admin-ui/src/main.tsx** — Purpose: React bootstrap hooking AuthProvider, QueryClient, Router; Key exports: ReactDOM render tree; Cross-refs: `App.tsx`; TODOs/Risks: None.
- **apps/admin-ui/src/App.tsx** — Purpose: App shell with nav + routing; Key exports: nav definitions; Cross-refs: page components; TODOs/Risks: No route guards beyond token presence; add permission gating.
- **apps/admin-ui/src/providers/AuthProvider.tsx** — Purpose: In-memory auth context; Key exports: `AuthProvider`, `useAuth`; Cross-refs: all pages; TODOs/Risks: Token lost on refresh; consider sessionStorage/localStorage.
- **apps/admin-ui/src/utils/api.ts** — Purpose: Fetch helper with base URL + auth header; Key exports: `apiRequest`; Cross-refs: all API calls; TODOs/Risks: Throwing raw text errors—wrap for user-friendly messages.
- **apps/admin-ui/src/components/JsonEditor.tsx** — Purpose: Minimal textarea JSON editor; Key exports: component; Cross-refs: Dictionaries page; TODOs/Risks: Add validation feedback.
- **apps/admin-ui/src/components/Modal.tsx** — Purpose: Modal wrapper; Key exports: component; Cross-refs: Formulas/Dictionaries pages; TODOs/Risks: Missing accessibility features (focus trap, ESC close).
- **apps/admin-ui/src/pages/LoginPage.tsx** — Purpose: Magic-link login form; Key exports: component; Cross-refs: `/auth/magic-link`; TODOs/Risks: No CSRF/rate limiting UI; ensure backend enforces.
- **apps/admin-ui/src/pages/DashboardPage.tsx** — Purpose: Health & inventory overview; Key exports: component; Cross-refs: `/sites/health`, `/formulas`, `/dictionaries`, `/runs`; TODOs/Risks: Expects `status` property that API currently doesn't provide—align with actual JSON.
- **apps/admin-ui/src/pages/FormulasPage.tsx** — Purpose: Formula management UI with dry-run preview; Key exports: component; Cross-refs: `/formulas`, `/backfill`; TODOs/Risks: Expression editor lacks linting; runDryRun uses whole workspace without filter options.
- **apps/admin-ui/src/pages/DictionariesPage.tsx** — Purpose: Dictionary CRUD; Key exports: component; Cross-refs: `/dictionaries`; TODOs/Risks: JSON editing manual; add schema suggestions.
- **apps/admin-ui/src/pages/BackfillPage.tsx** — Purpose: Backfill runner with dry-run toggle; Key exports: component; Cross-refs: `/backfill`; TODOs/Risks: Manual ISO entry; unify with DryRunPage or remove duplication.
- **apps/admin-ui/src/pages/DryRunPage.tsx** — Purpose: Simplified dry-run form; Key exports: component; Cross-refs: `/backfill`; TODOs/Risks: Duplicates BackfillPage functionality—consider consolidation.
- **apps/admin-ui/src/pages/AuditLogPage.tsx** — Purpose: Audit table with status filter; Key exports: component; Cross-refs: `/runs`; TODOs/Risks: No pagination; JSON diff shown raw.
- **apps/admin-ui/src/pages/SettingsPage.tsx** — Purpose: Health summary + settings form + session info; Key exports: component; Cross-refs: `/sites/health`, `/settings`; TODOs/Risks: Settings controller currently in-memory; warn users.
- **apps/admin-ui/src/styles.css** — Purpose: Global styling for iframe-friendly UI; Key exports: layout classes; TODOs/Risks: Optimize for smaller iframe widths.
- **apps/admin-ui/src/__tests__/smoke.spec.ts** — Purpose: placeholder smoke test; Key exports: trivial expectation; TODOs/Risks: Expand coverage.
- **apps/admin-ui/dist/** — Purpose: Built assets tracked in repo; TODOs/Risks: Should be gitignored to avoid stale bundles (coordinate before removal).

## Test Suite
- **tests/setup.ts** — Purpose: Vitest env preparation (sets env vars, skip DB); TODOs/Risks: Always enables DEV_ALLOW_UNSIGNED; ensure security tests override when needed.
- **tests/formulas.spec.ts** — Purpose: Validate formula engine dependency, dropdown autofix, equality skip; Cross-refs: `FormulaEngine`; TODOs/Risks: Add OT multiplier coverage and rest-gap cases.
- **tests/formulaEngineSecurity.spec.ts** — Purpose: Ensure only whitelisted functions allowed, regex safeguards, numeric coercion; TODOs/Risks: Update when adding new helpers.
- **tests/webhookSecurity.spec.ts** — Purpose: Signature verification tests; TODOs/Risks: Add tests for newline variations, uppercase hex.
- **tests/webhook.spec.ts** — Purpose: Webhook handler integration (valid/invalid signature flows); TODOs/Risks: Extend for idempotency and diff detection.
- **tests/backfill.spec.ts** — Purpose: Backfill service behavior (rate limit retries, pagination, dry-run, errors); TODOs/Risks: Add tests for rest gaps & OT outputs.

## Miscellaneous Assets
- **addon-demo.js** — Purpose: CommonJS Express addon demo server; Cross-refs: root marketplace guide; TODOs/Risks: Duplicate of simple-addon; keep single source.
- **simple-addon.mjs** — Purpose: ESM HTTP addon demo server; Cross-refs: developer instructions; TODOs/Risks: Minimal logging; ensure not used in prod.
- **ngrok.yml** — Purpose: Sample ngrok config (API/admin tunnels); TODOs/Risks: `authtoken` placeholder—ensure not committed with secrets.
- **apps/api/dist/** & **apps/admin-ui/dist/** — Purpose: Compiled artifacts currently in repo; TODOs/Risks: remove from git to avoid divergence; rely on build pipeline.
