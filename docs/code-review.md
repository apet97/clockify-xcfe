# Clockify xCFE Add-on Review

This audit captures operational risks I noticed while trying to run the add-on locally and reviewing the Clockify integration code. Each item includes the concrete code that triggers the problem plus suggestions for remediation.

## 1. Lifecycle installs fail without a working database
- `handleInstalled` always calls `upsertInstallation`, which immediately opens a PostgreSQL connection via `getDb`. When Postgres is unavailable (the default for addon-only testing), the promise rejects inside the `try` block and the handler falls through to the `catch` clause, returning `401 { error: "Invalid lifecycle token" }` for what is really a database outage.【F:apps/api/src/controllers/lifecycleController.ts†L15-L49】【F:apps/api/src/lib/db.ts†L27-L48】
- The manifest health check takes the same dependency by connecting to the database before returning JSON, so `/v1/sites/health` also fails when Postgres is down even though Clockify only needs manifest + lifecycle endpoints online for installation.【F:apps/api/src/controllers/healthController.ts†L12-L64】

**Impact:** Marketplace installs report "invalid token" even if Clockify sent a valid JWT, because the handler masks infrastructure problems. That matches the install errors I observed.

**Suggestions:**
  - Short-circuit lifecycle handlers when `CONFIG.SKIP_DATABASE_CHECKS` (or a new flag) is enabled so addon developers can complete the install handshake without Postgres.
  - Differentiate auth failures from storage failures (e.g., wrap only the JWT verification in a `try/catch` and respond with `500` for DB errors) so operators can see the real root cause.
  - Teach `/v1/sites/health` to degrade gracefully: if the database is optional for installation, report `ok: true` when the process is up even if Postgres is unreachable.

## 2. RSA key is mandatory even in development
- `env.ts` requires `RSA_PUBLIC_KEY_PEM` unconditionally; missing the value throws during startup. That makes the API unusable for addon development unless the Clockify public key is manually copied into `.env`, which is not documented in the repo.【F:apps/api/src/config/env.ts†L9-L53】
- Lifecycle handlers never check `CONFIG.DEV_ALLOW_UNSIGNED`, so there is no way to bypass JWT verification when running a local Clockify simulator or fixtures.【F:apps/api/src/controllers/lifecycleController.ts†L15-L152】【F:apps/api/src/lib/jwt.ts†L61-L104】

**Impact:** `pnpm test` fails out of the box and local addon installs cannot proceed unless developers already have the real Clockify signing key.

**Suggestions:**
  - Provide a documented dev/test key (the Clockify docs publish one) or relax the schema to allow skipping verification when `DEV_ALLOW_UNSIGNED=true`.
  - Update `tests/setup.ts` to seed sane defaults so the Vitest suites run without manual env exports.

## 3. CORS configuration blocks iframe usage
- `app.ts` configures CORS with `origin: '*'` and `credentials: true`. The CORS spec forbids returning `Access-Control-Allow-Origin: *` alongside credentials, so browsers drop every authenticated response. Clockify loads add-ons inside an iframe that depends on cookies, so the admin UI will fail to call the API.【F:apps/api/src/app.ts†L26-L50】

**Suggestions:**
  - When no explicit origin is configured, echo `req.header('Origin')` (via `cors({ origin: true, credentials: true })`) or default to Clockify's iframe origins instead of `*`.

## 4. Health endpoint leaks misleading success
- `healthCheck` returns `manifest: true` even if fetching the manifest would fail due to earlier validation errors, and conflates API uptime with database readiness. Marketplace verifiers typically want to know whether they can fetch the manifest and lifecycle URLs; the current implementation reports success while masking missing manifest routes or DB errors.【F:apps/api/src/controllers/healthController.ts†L12-L64】

**Suggestion:** Split runtime health (manifest + lifecycle reachable) from deep checks (database connectivity), and surface individual failure reasons so the developer portal can display actionable diagnostics.

## 5. Repository hygiene
- `apps/api/node_modules` is committed, which bloats the repo and makes dependency audits harder. Remove tracked modules and add a root `.gitignore` entry covering `apps/*/node_modules`. (I did not commit that change to avoid a massive diff, but it should happen.)

---

Addressing the configuration and error-handling items should unblock addon installation attempts and make local development much smoother. Let me know if you want me to prototype the fixes above.
