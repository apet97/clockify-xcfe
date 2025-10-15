# Marketplace Submission Checklist

## Credentials & Environment
- [ ] Production `.env` filled with workspace-specific values (token, API key, webhook secret, encryption key).
- [ ] `BASE_URL` points at the deployed API (HTTPS) and `ADMIN_UI_ORIGIN` includes the production iframe host.
- [ ] `CLOCKIFY_REGION` set to the workspace region (`euc1`, `use2`, `euw2`, `apse2`).
- [ ] `ADDON_ID` matches the ID assigned in the Clockify marketplace portal.
- [ ] Run `scripts/verify-env.sh` to confirm required variables.

## Infrastructure
- [ ] Apply `infra/db.sql` to the production Postgres instance (includes new `runs` indexes and columns).
- [ ] Update `infra/manifest.json` with production webhook/admin URLs, icon, and support contact.
- [ ] Configure cloud logs/monitoring to collect Pino output (correlation IDs aid debugging).

## Functional QA
- [ ] Webhook smoke test: POST sample payload to `/v1/webhooks/clockify` → verify `runs` entry shows OT multiplier + fingerprint.
- [ ] Admin UI navigation in Clockify iframe: Dashboard, Formulas (create/update/delete), Dictionaries, Backfill dry-run, Audit log.
- [ ] Backfill dry-run for last 24h returns OT multiplier/flag columns.
- [ ] Backfill apply on staging workspace updates custom fields once (no duplicate due to fingerprint cache).
- [ ] Dropdown/numeric dictionaries enforce validation (try invalid value via formula).

## Performance & Resilience
- [ ] Load test webhook endpoint at ~40 RPS sustained for 2 minutes (no 5xx, fingerprint dedupe works).
- [ ] Verify rate-limit retries respect `Retry-After` headers (check logs during 429 simulation).
- [ ] Confirm per-workspace queue prevents cross-tenant throttling.

## Security
- [ ] Lifecycle JWT verified with production RSA key (`RSA_PUBLIC_KEY_PEM`).
- [ ] HMAC secret stored in secrets manager; webhook returns 401 for tampered payload.
- [ ] Audit log redacts addon/token headers (check Pino output for `[REDACTED]`).

## Artifacts to Attach
- [ ] Screenshot: Admin UI Dashboard with OT metrics.
- [ ] Screenshot: Backfill preview showing OT multiplier table.
- [ ] Screenshot: Audit log entry with correlation ID & fingerprint.
- [ ] Test run output (`pnpm run test`).
- [ ] Boot log snippet from `BOOT.LOG` covering service start.

## Submission
- [ ] README updated with environment matrix + OT documentation.
- [ ] `ARCHITECTURE.md` and `NOTES.md` included in PR.
- [ ] `MARKETPLACE_LAUNCH.md` cross-checked and referenced in submission form.
- [ ] Privacy/security statement uploaded per Clockify marketplace policy.
