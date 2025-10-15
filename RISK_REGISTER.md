# Risk Register

| Risk | Severity × Likelihood | Mitigation |
| --- | --- | --- |
| Duplicate webhook processing despite retries | High × Medium | SHA-256 fingerprint cache (5 min TTL) + before/after hashes prevent repeat PATCH. Monitor `/v1/runs` for duplicate fingerprints when adjusting TTL. |
| Clockify rate limiting (429) causing backlog | High × Medium | Per-workspace queue enforced by `RateLimiter`; respects `Retry-After`, exponential backoff, configurable `RATE_LIMIT_RPS`. Add visibility via logs/metrics. |
| Region mismatch between REST and Reports API | Medium × Medium | Single `CLOCKIFY_REGION` drives both hosts; fallback derives reports host from `CLOCKIFY_BASE_URL`. Validate region-specific workspace before launch. |
| Missing webhook signatures in production | High × Low | `CLOCKIFY_WEBHOOK_SECRET` required; CI runs `scripts/verify-env.sh`. `DEV_ALLOW_UNSIGNED` only for local dev. |
| Formula misconfiguration (incorrect OT payouts) | High × Medium | Seed script installs reference OT formulas/dictionaries. Admin UI highlights diagnostics; regression tests in `tests/otRules.spec.ts`. |
| Postgres outage / schema drift | Medium × Medium | Schema definitions in `infra/db.sql`; re-runnable migrations; add database health checks + backups. |
| Admin UI iframe blocked by CSP/CORS | Medium × Low | `ADMIN_UI_ORIGIN` supports comma-separated origins; document per workspace; test inside Clockify staging environment. |
| Sensitive data leaking to logs | Medium × Low | Logger redacts auth headers and tokens; review downstream log sinks for masking. |
| Backfill job overrun on long ranges | Medium × Medium | Backfill limits to 366 days; paginated processing with per-day correlation IDs. Consider scheduled automation for large historical loads. |
| Lifecycle event verification failure | Low × Medium | Lifecycle controller uses `verifyClockifyJwt`; ensure production RSA key configured and monitor logs for malformed tokens. |
