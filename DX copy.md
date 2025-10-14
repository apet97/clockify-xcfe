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
- **Type safety**: `pnpm --filter @xcfe/api typecheck` and `pnpm --filter @xcfe/admin-ui typecheck` (via `pnpm -r typecheck`).
- **Manual OT verification**:
  1. Seed demo data via `scripts/seed-demo.sh`.
  2. POST time-entry webhook sample from `docs/Clockify_Webhook_JSON_Samples (1).md`.
  3. Inspect `/v1/runs` for `OT.multiplier`/`OT.flag` changes and ensure fingerprint caching prevents duplicate patches.

## Logging & Observability
- All API requests emit Pino logs with `correlationId`; add `LOG_LEVEL=debug` locally for verbose traces.
- Webhook handler writes fingerprints to `/v1/runs.diff`. Duplicate payloads within 5 minutes are skipped.
- Backfill operations log start/end per day and include correlation IDs for each time entry update.

## Deployment Checklist
1. Update `infra/manifest.json` with production webhook/admin URLs.
2. Run `scripts/verify-env.sh` in CI to ensure required secrets exist.
3. Apply `infra/db.sql` schema to production database.
4. Run `pnpm run build` and capture artifact checksums if deploying via container.
5. Execute `pnpm run test` (attach output to release/PR).
6. Produce Admin UI screenshots and webhook/backfill diffs for release notes.

## Troubleshooting
| Issue | Fix |
| --- | --- |
| `docker compose` fails with daemon socket error | Start Docker Desktop or set `DATABASE_URL` to a managed instance. |
| Webhook returns 401 (`Invalid webhook signature`) | Verify `CLOCKIFY_WEBHOOK_SECRET`, or set `DEV_ALLOW_UNSIGNED=true` for local debugging only. |
| Rate limit retries flooding logs | Lower `RATE_LIMIT_RPS`, or ensure upstream clocks down webhook fan-out. |
| Backfill dry-run shows zero updates | Confirm formulas and dictionaries exist for that workspace; run `scripts/seed-demo.sh` for OT demo values. |

## Repository Hygiene
- Use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`...).
- Keep build artifacts (`apps/*/dist`) out of commits; final bundle generated during CI/CD.
- Prefer `pnpm --recursive` commands when touching both packages.

## Helpful Links
- [Architecture overview](ARCHITECTURE.md)
- [Detailed notes](NOTES.md)
- [Market launch checklist](MARKETPLACE_CHECKLIST.md)
- [Clockify docs digest](docs/https-docs-clockify-me.md)
