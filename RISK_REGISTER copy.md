# Risk Register

| Risk | Severity × Likelihood | Mitigation / Notes |
| --- | --- | --- |
| Duplicate webhook processing despite retries | High × Medium | Fingerprint cache (5 min) plus before/after hash safeguards; monitor `/v1/runs` for duplicate fingerprints and tune TTL if Clockify redelivers slower. |
| Clockify rate limiting (429) leading to backlog | High × Medium | Per-workspace queue with exponential backoff and respect for `Retry-After`; expose metrics via logs, consider persistent queue if spikes persist. |
| Region mismatch between REST and Reports API | Medium × Medium | `CLOCKIFY_REGION` drives both base URLs; fallback derives reports host automatically. Validate in staging before moving regions. |
| Missing webhook signatures in production | High × Low | Enforce `CLOCKIFY_WEBHOOK_SECRET`; `DEV_ALLOW_UNSIGNED` should be `false` outside dev. CI check via `scripts/verify-env.sh`. |
| Formula misconfiguration breaking OT payouts | High × Medium | Seed script installs reference formulas/dictionaries; Admin UI surfaces diagnostics & warnings; add regression tests in `tests/otRules.spec.ts`. |
| Postgres downtime or schema drift | Medium × Medium | `infra/db.sql` versioned in repo; migrations re-runnable; ensure backups and connection pooling observability. |
| Admin UI iframe CSP/CORS issues | Medium × Low | `ADMIN_UI_ORIGIN` supports comma-separated list; document for tenants; test in each Clockify environment. |
| Secrets leakage in logs | Medium × Low | Logger redacts `authorization`, `x-api-key`, `x-addon-token`; review log sink settings before production. |
| Manual backfill playing catch-up on long ranges | Medium × Medium | Backfill enforces 366-day window and paginated processing; consider scheduled jobs or chunking for >1 year history. |
| Unhandled Clockify lifecycle events | Low × Medium | Lifecycle controller persists installations; extend tests when new events introduced. Monitor marketplace changelog. |
