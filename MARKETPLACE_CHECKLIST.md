# Marketplace Submission Checklist

## Environment & Secrets
- [ ] `.env` populated with production values (`BASE_URL`, `ADMIN_UI_ORIGIN`, `WORKSPACE_ID`, `ADDON_ID`, `ADDON_TOKEN` or `API_KEY`, `CLOCKIFY_WEBHOOK_SECRET`, `ENCRYPTION_KEY`).
- [ ] `CLOCKIFY_REGION` set to target workspace region (euc1/use2/euw2/apse2).
- [ ] `scripts/verify-env.sh` executed in CI/CD prior to deploy.

## Infrastructure
- [ ] `infra/db.sql` applied to production Postgres (ensures new `runs` columns + indexes).
- [ ] `infra/manifest.json` updated with production `iframeUrl` and `webhookUrl`.
- [ ] Logging & monitoring configured to ingest Pino logs (correlation IDs, fingerprints).

## Functional QA
- [ ] Webhook sample triggers OT formulas (inspect `/v1/runs` for `OT` metadata and fingerprint).
- [ ] Admin UI smoke: Dashboard metrics, Formulas CRUD, Dictionaries edit, Backfill dry-run/apply, Audit log filter.
- [ ] Backfill dry-run displays OT multiplier/flag columns, apply mode updates exactly once per entry.
- [ ] Dictionary enforcement tested (invalid dropdown + numeric bounds) with appropriate warnings/errors.

## Performance & Resilience
- [ ] Webhook endpoint load-tested at >=40 RPS (no unhandled errors; rate-limit retries respect `Retry-After`).
- [ ] Backfill job tested over multi-day range; rate limits/backoffs behave as expected.
- [ ] Duplicate webhook replay ignored via fingerprint cache (verified with repeated payload within 5 minutes).

## Security
- [ ] Lifecycle JWT verification succeeds with production RSA key (set `RSA_PUBLIC_KEY_PEM`).
- [ ] HMAC signature enforcement confirmed (invalid signature returns 401).
- [ ] Secrets stored in secrets manager / env, not committed. Logger redaction verified (`authorization`, `x-api-key`, `x-addon-token`).

## Artefacts for Review
- [ ] `pnpm run test` output attached to PR/deployment.
- [ ] Screenshots: Admin Dashboard, Backfill preview (with OT columns), Audit log entry showing fingerprint + correlation ID.
- [ ] Updated README, DX guide, risk register included in PR.
- [ ] `BOOT.LOG` snippet from latest bootstrap.

## Submission
- [ ] Privacy & support documentation uploaded per marketplace requirements.
- [ ] Release notes mention OT multiplier behaviour, fingerprint dedupe, and region-aware endpoints.
- [ ] Support SLA (24h) communicated in marketplace listing (`support@example.com`).
