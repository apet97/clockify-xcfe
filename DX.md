# Developer Experience Cheatsheet

## Daily Commands
| Action | Command |
| --- | --- |
| Install deps | `corepack enable pnpm && pnpm install` |
| Start full stack | `pnpm run dev` |
| Start API only | `pnpm --filter @xcfe/api dev` |
| Start Admin UI only | `pnpm --filter @xcfe/admin-ui dev` |
| Type-check API | `pnpm --filter @xcfe/api typecheck` |
| Run full test suite | `pnpm run test` |
| Run API tests only | `pnpm --filter @xcfe/api test` |
| Run Admin UI tests | `pnpm --filter @xcfe/admin-ui test` |
| Seed demo formulas | `scripts/seed-demo.sh` |

## Environment Bootstrap
1. Copy `.env.sample` → `.env` and fill required keys (see README table).
2. Ensure Docker Desktop is running if you want Postgres via Compose (otherwise provide a remote `DATABASE_URL`).
3. Run `pnpm run dev`; the script now skips database bootstrap gracefully when Docker is unavailable.
4. Generate a magic link token: `curl -X POST http://localhost:8080/v1/auth/magic-link -d '{"userId":"usr_123"}'`.
5. Open `http://localhost:5173` in Clockify iframe/emulator and paste the token when prompted.

## Testing & QA
- **API tests**: `pnpm --filter @xcfe/api test` (Vitest). Run with `--watch` for iterative development.
- **UI tests**: `pnpm --filter @xcfe/admin-ui test`.
- **Type safety**: `pnpm --filter @xcfe/api typecheck` and `pnpm --filter @xcfe/admin-ui typecheck` (or `pnpm -r typecheck`).
- **Manual OT verification**:
  1. Seed demo data via `scripts/seed-demo.sh`.
  2. POST time-entry webhook sample from `docs/Clockify_Webhook_JSON_Samples (1).md`.
  3. Inspect `/v1/runs` for OT multiplier/flag and fingerprint to confirm idempotency.

## Logging & Observability
- API uses Pino with correlation IDs; set `LOG_LEVEL=debug` locally.
- Webhook handler caches SHA-256 fingerprints for 5 minutes to suppress duplicate patches.
- Backfill logs include per-day correlation IDs and update counts.

## Settings Persistence
- `/v1/settings` now reads from and writes to the Postgres `settings` table.
- The `handleSettingsUpdated` lifecycle hook stores the raw blob in `installations.settings_json` while mirroring relevant keys (`strict_mode`, `reference_months`, `region`) to the canonical `settings` table.
- Running `infra/db.sql` is **required** before deploying; ensure the `settings` table exists.
- When `SKIP_DATABASE_CHECKS=true`, the service returns sensible defaults (`strict_mode=false`, `reference_months=3`, `region=CONFIG.CLOCKIFY_REGION`) without querying Postgres.

## Deployment Checklist
1. Update `infra/manifest.json` with production URLs.
2. Run `scripts/verify-env.sh` in CI to ensure secrets exist.
3. Apply `infra/db.sql` to production Postgres (including the `settings` table).
4. `pnpm run build` and store artifacts (container or serverless bundle).
5. Capture `pnpm run test` output and Admin UI screenshots for the release PR.
6. Confirm audit logs show `workspace_id`, `event`, `correlation_id`, and fingerprint data.

## Troubleshooting
| Issue | Fix |
| --- | --- |
| Docker daemon not running | Script logs warning and skips Postgres; start Docker or point `DATABASE_URL` at external DB. |
| Webhook rejected (401) | Verify `CLOCKIFY_WEBHOOK_SECRET`; only use `DEV_ALLOW_UNSIGNED` in development. |
| Rate limits triggered | Client auto-retries with jitter; reduce upstream burst rate or lower `RATE_LIMIT_RPS`. |
| Backfill dry-run returns empty | Ensure formulas/dictionaries exist for workspace; run seed script for OT demo data. |

## Repository Hygiene
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`...).
- Avoid committing `apps/*/dist` artifacts; rebuild during CI/CD.
- Prefer `pnpm --recursive` commands when touching multiple packages.

## Links
- [Architecture](ARCHITECTURE.md)
- [Notes](NOTES.md)
- [Marketplace checklist](MARKETPLACE_CHECKLIST.md)
- [Risk register](RISK_REGISTER.md)
