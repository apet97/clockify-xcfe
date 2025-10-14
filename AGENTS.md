# Repository Guidelines

## Project Structure & Module Organization
- `/apps/api`: TypeScript Express service connecting Clockify webhooks to formula evaluation, validation, and PostgreSQL storage.
- `/apps/admin-ui`: Vite + React iframe app for managing formulas, dictionaries, backfills, and audit trails inside Clockify.
- `/infra`: Infrastructure artifacts like `db.sql` schema, Clockify marketplace `manifest.json`, and optional deployment configs.
- `/scripts`: Helper scripts (`dev.sh`, `seed-demo.sh`, `verify-env.sh`) covering local orchestration, demo data seeding, and environment checks.
- `/tests`: Vitest suites such as `webhook.spec.ts` and `formulas.spec.ts` that assert webhook behaviors and formula correctness.
- `/docs`: Reference material including the Clockify API digest and webhook samples that inform implementation decisions.

## Build, Test, and Development Commands
- `pnpm install`: install workspace dependencies for both API and admin UI.
- `pnpm run dev`: launch Postgres (via Docker), API watcher, and admin UI (Vite) through `scripts/dev.sh`.
- `pnpm run test`: execute unit and integration tests; extends to webhook handlers and formula engine coverage.
- `pnpm run lint`: apply ESLint/Prettier rules to TypeScript and React code.

## Coding Style & Naming Conventions
- TypeScript throughout; favor explicit types and Zod schemas for runtime validation.
- Use ESLint with Clockify-specific ruleset, Prettier formatting (2-space indent, single quotes, trailing commas where valid).
- Name formulas and components in PascalCase; utilities and hooks use camelCase; scripts use kebab-case.

## Testing Guidelines
- Write tests in `/tests` or alongside modules with `.spec.ts` suffix.
- Leverage fixtures from `/docs/Clockify_Webhook_JSON_Samples (1).md` to assert webhook parsing.
- Ensure formula engine tests capture numeric, dropdown, and dependency scenarios; target >85% coverage on critical modules.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `chore:`) mirroring repository history.
- Keep commits scoped to a single functional change; include relevant scripts or schema updates when affected.
- Pull requests should describe formula impacts, include test evidence (`pnpm run test` output), link Clockify issue IDs, and attach admin UI screenshots for UX changes.

## Security & Configuration Tips
- Store API tokens and encryption keys solely in `.env` or secrets manager; never commit them.
- Reference `/docs/https-docs-clockify-me.md` for region-specific base URLs and rate limits; configure `CLOCKIFY_BASE_URL` accordingly.
- Audit logs must redact PII; capture correlation IDs for webhook requests and PATCH operations.
