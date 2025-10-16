# CI/CD Checklist for xCFE

## Pre-Deployment Checks
- [ ] pnpm -w typecheck passes
- [ ] pnpm -w lint passes
- [ ] pnpm -w test passes (if tests exist)
- [ ] Build completes: pnpm run build
- [ ] Manifest valid JSON: cat infra/manifest.json | jq .

## Environment Variables (Production)
- [ ] BASE_URL set to Vercel deployment URL
- [ ] CLOCKIFY_PUBLIC_KEY_PEM set (RSA public key from Clockify)
- [ ] ADDON_KEY matches manifest.json "key" field
- [ ] WORKSPACE_ID set (target workspace)
- [ ] DATABASE_URL set (if using DB persistence)
- [ ] ENCRYPTION_KEY set (for magic link JWT)
- [ ] CLOCKIFY_WEBHOOK_SECRET set (for HMAC verification)
- [ ] DEV_ALLOW_UNSIGNED=false or unset (never true in production)
- [ ] NODE_ENV=production

## Manifest Validation
- [ ] /manifest endpoint returns 200 (not 500)
- [ ] /health endpoint returns 200
- [ ] All lifecycle GET probes return 200:
  - [ ] /v1/lifecycle/installed
  - [ ] /v1/lifecycle/status-changed
  - [ ] /v1/lifecycle/settings-updated
  - [ ] /v1/lifecycle/updated
  - [ ] /v1/lifecycle/uninstalled

## Security Checks
- [ ] JWT verification uses RSA256 with CLOCKIFY_PUBLIC_KEY_PEM
- [ ] Webhook HMAC verification enabled (CLOCKIFY_WEBHOOK_SECRET set)
- [ ] No secrets logged or exposed in responses
- [ ] CORS headers configured for Clockify iframe
- [ ] Rate limiting enabled (rateLimiter wraps all Clockify API calls)

## Functional Tests
- [ ] Install lifecycle succeeds (POST /v1/lifecycle/installed)
- [ ] Webhook ingestion succeeds (POST /v1/webhooks/clockify)
- [ ] Formula evaluation runs without errors
- [ ] Backfill completes (POST /v1/backfill)
- [ ] Admin UI loads in iframe (/ui/sidebar)
- [ ] Region/host derivation works (backendUrl → reportsUrl transformation)

## Integration Tests
- [ ] Create time entry in Clockify → webhook fires → formula applied → PATCH succeeds
- [ ] Verify dedupe: duplicate webhook event → no duplicate PATCH
- [ ] Verify rate limit handling: 429 response → exponential backoff → retry
- [ ] Verify Reports API: backfill → getDetailedReport → pageSize=200 → pagination works

## Deployment
- [ ] Vercel routes configured (vercel.json)
- [ ] Build succeeds on Vercel
- [ ] Manifest accessible at https://<deployment>/manifest
- [ ] Health check accessible at https://<deployment>/health
- [ ] Doctor script passes: node scripts/doctor.js

## Post-Deployment
- [ ] Install add-on on test workspace
- [ ] Verify lifecycle hooks fire (check logs)
- [ ] Verify webhook registration (check Clockify webhooks list)
- [ ] Test formula creation and execution
- [ ] Test backfill on sample date range
- [ ] Monitor logs for errors, rate limits, auth failures

## Rollback Plan
- [ ] Previous deployment URL saved
- [ ] Rollback command ready: vercel rollback
- [ ] Database migrations reversible (if any)
- [ ] Webhook registrations can be deleted manually
