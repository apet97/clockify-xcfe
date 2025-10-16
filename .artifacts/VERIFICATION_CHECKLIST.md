# Post-Deployment Verification Checklist

## Phase 1: Environment Setup ✅

### 1.1 Required Environment Variables
- [ ] `ENCRYPTION_KEY` set (48+ chars base64)
- [ ] `SKIP_DATABASE_CHECKS=true` set
- [ ] `ADDON_KEY=xcfe-custom-field-expander` set
- [ ] `WORKSPACE_ID` set (your Clockify workspace ID)
- [ ] `CLOCKIFY_WEBHOOK_SECRET` set (32+ chars hex)
- [ ] `ADMIN_SECRET` set (32+ chars base64)
- [ ] `CLOCKIFY_PUBLIC_KEY_PEM` set (RSA public key from Developer Portal)

**Verification Command**:
```bash
vercel env pull .env.production --environment=production
grep -E '^(ENCRYPTION_KEY|SKIP_DATABASE_CHECKS|ADDON_KEY|WORKSPACE_ID|CLOCKIFY_WEBHOOK_SECRET|ADMIN_SECRET|CLOCKIFY_PUBLIC_KEY_PEM)=' .env.production | wc -l
# Expected: 7
```

### 1.2 Vercel KV Configuration
- [ ] KV store `xcfe-kv-prod` created
- [ ] KV connected to project in production environment
- [ ] `KV_REST_API_URL` set
- [ ] `KV_REST_API_TOKEN` set
- [ ] `KV_URL` set

**Verification Command**:
```bash
vercel kv ls
# Expected: xcfe-kv-prod listed

grep -E '^KV_' .env.production
# Expected: 3 lines (KV_REST_API_URL, KV_REST_API_TOKEN, KV_URL)
```

### 1.3 Deployment Status
- [ ] `vercel --prod` completed successfully
- [ ] No build errors in logs
- [ ] Function deployed to correct region

**Verification Command**:
```bash
vercel ls --prod | head -5
vercel logs --prod | tail -20
```

---

## Phase 2: Health Checks ✅

### 2.1 Doctor Script
- [ ] All environment variables show as "set"
- [ ] `KV_CONFIGURED=YES`
- [ ] `/manifest` returns 200
- [ ] `/health` returns 200
- [ ] All lifecycle GET probes return 200

**Verification Command**:
```bash
export BASE_URL="https://your-vercel-url.vercel.app"
node scripts/doctor.js
# Expected exit code: 0 (all checks passed)
```

### 2.2 Manifest Validation
- [ ] Manifest accessible at `https://{vercel-url}/manifest`
- [ ] Manifest JSON valid
- [ ] `key` matches `ADDON_KEY`
- [ ] `name` is "xCustom Field Expander"
- [ ] `minimalSubscriptionPlan` is "PRO"
- [ ] All required lifecycle hooks listed

**Verification Command**:
```bash
curl -sS $BASE_URL/manifest | jq '.key, .name, .minimalSubscriptionPlan, .lifecycle | keys'
# Expected:
# "xcfe-custom-field-expander"
# "xCustom Field Expander"
# "PRO"
# ["installed", "settings-updated", "status-changed", "uninstalled", "updated"]
```

### 2.3 Health Endpoint
- [ ] Returns 200 OK
- [ ] JSON response with `{ "status": "ok" }` or similar

**Verification Command**:
```bash
curl -sS $BASE_URL/health
# Expected: {"status":"ok"} or similar
```

---

## Phase 3: Security Patch Verification ✅

### 3.1 DEV_ALLOW_UNSIGNED Production Guard
- [ ] Production deployment boots successfully (no `DEV_ALLOW_UNSIGNED` error)
- [ ] Config validation passes

**Location**: `apps/api/src/config/env.ts:130-133`

**Test**: Try setting `DEV_ALLOW_UNSIGNED=true` in production → should fail to boot

### 3.2 HMAC Fail-Closed
- [ ] Webhook requests without signature return 401
- [ ] Webhook requests with invalid signature return 401

**Location**: `apps/api/src/lib/webhookSecurity.ts:6-8`

**Test**:
```bash
# Missing signature → 401
curl -X POST $BASE_URL/v1/webhooks/clockify \
  -H "Content-Type: application/json" \
  -d '{"event":"TIME_ENTRY_UPDATED"}' \
  -w "\nHTTP %{http_code}\n"

# Expected: HTTP 401
```

### 3.3 JWT aud Validation
- [ ] Lifecycle webhooks with mismatched `aud` rejected
- [ ] Error message: "Invalid JWT audience"

**Location**: `apps/api/src/lib/jwt.ts:99-101`

**Test**: Manually decode a JWT and verify `aud` claim matches `ADDON_KEY`
```bash
# Decode JWT (replace with actual token)
JWT="<paste-jwt-here>"
echo $JWT | cut -d. -f2 | base64 -d 2>/dev/null | jq '.aud'
# Expected: "xcfe-custom-field-expander" (or null if not set)
```

### 3.4 JWT nbf Validation
- [ ] JWTs with future `nbf` rejected
- [ ] Error message: "JWT not yet valid (nbf claim in future)"

**Location**: `apps/api/src/lib/jwt.ts:107-109`

**Test**: Check logs for any "JWT not yet valid" errors (should not occur in normal operation)

### 3.5 JWT Replay Protection (KV-Backed)
- [ ] Duplicate JWT usage returns "JWT replay detected"
- [ ] jti claim stored in KV with TTL matching JWT expiry

**Location**: `apps/api/src/lib/jwt.ts:124-135`

**Test**: See "Phase 5: JWT Replay Test" below

### 3.6 Persistent Webhook Dedupe (KV-Backed)
- [ ] Duplicate webhook events return `{ "duplicate": true }`
- [ ] Fingerprint cache persists across serverless restarts

**Location**: `apps/api/src/controllers/webhookController.ts:211-223`

**Test**: See "Phase 6: Webhook Dedupe Test" below

---

## Phase 4: Add-on Installation ✅

### 4.1 Update Developer Portal
- [ ] Manifest URL updated to `https://{vercel-url}/manifest`
- [ ] Manifest validation passed in Developer Portal
- [ ] Add-on status: "Active" or "Published"

**Steps**:
1. Go to https://developer.clockify.me
2. Navigate to your add-on settings
3. Update Manifest URL
4. Click "Validate Manifest"
5. Verify no errors

### 4.2 Install Add-on
- [ ] Add-on installed on test workspace
- [ ] Lifecycle `installed` webhook received
- [ ] Installation token cached in `.state/install.json`
- [ ] `rememberInstallation()` executed successfully

**Verification Command**:
```bash
# Check install state
cat .state/install.json | jq .
# Expected: { "authToken": "...", "backendUrl": "...", ... }

# Check Vercel logs for lifecycle webhook
vercel logs --prod | grep -i "lifecycle.*installed"
```

### 4.3 Installation Token Validation
- [ ] JWT signature verified with `CLOCKIFY_PUBLIC_KEY_PEM`
- [ ] Claims validated: `iss=clockify`, `type=addon`, `aud={ADDON_KEY}`
- [ ] `backendUrl` and `workspaceId` extracted

**Verification**: Check logs for successful JWT verification during installation

---

## Phase 5: JWT Replay Test ✅

### 5.1 Capture Installation JWT
- [ ] JWT captured from lifecycle `installed` webhook
- [ ] JWT saved to `.artifacts/test-install-jwt.txt`

**Steps**:
```bash
# From Vercel logs
vercel logs --prod | grep -oE "eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+" | head -1 > .artifacts/test-install-jwt.txt
```

### 5.2 First Request (Should Succeed)
- [ ] POST to `/v1/lifecycle/installed` with JWT succeeds
- [ ] jti stored in KV with TTL

**Test**:
```bash
JWT=$(cat .artifacts/test-install-jwt.txt)
curl -X POST $BASE_URL/v1/lifecycle/installed \
  -H "clockify-signature: $JWT" \
  -H "Content-Type: application/json" \
  -d '{"workspaceId":"test","addonId":"test"}' \
  -w "\nHTTP %{http_code}\n"
# Expected: HTTP 200
```

### 5.3 Second Request (Should Fail with Replay Error)
- [ ] POST with same JWT returns 401 or 403
- [ ] Error message: "JWT replay detected: this token has already been used"

**Test**:
```bash
# Immediately retry with same JWT
curl -X POST $BASE_URL/v1/lifecycle/installed \
  -H "clockify-signature: $JWT" \
  -H "Content-Type: application/json" \
  -d '{"workspaceId":"test","addonId":"test"}' \
  -w "\nHTTP %{http_code}\n"
# Expected: HTTP 401 with "JWT replay detected" error
```

### 5.4 Verify KV Storage
- [ ] jti key exists in KV: `jti:{jti_value}`
- [ ] TTL matches JWT expiry time

**Test**:
```bash
# Check KV keys (requires Vercel CLI with KV access)
vercel kv keys "jti:*"
# Expected: List of jti: prefixed keys
```

---

## Phase 6: Webhook Dedupe Test ✅

### 6.1 Create Test Time Entry
- [ ] Time entry created in Clockify workspace
- [ ] Webhook `TIME_ENTRY_UPDATED` received
- [ ] Formula evaluated and PATCH sent (if applicable)

**Steps**:
1. Go to Clockify web app
2. Create new time entry
3. Update a custom field
4. Check Vercel logs for webhook processing

### 6.2 First Webhook (Should Process)
- [ ] Webhook signature verified
- [ ] Time entry fetched via API
- [ ] Formula evaluated
- [ ] PATCH sent if changes detected
- [ ] Fingerprint stored in KV

**Verification**:
```bash
vercel logs --prod | grep -i "time_entry_updated\|applied custom field"
```

### 6.3 Duplicate Webhook (Should Skip)
- [ ] Send duplicate webhook with same payload
- [ ] Response: `{ "ok": true, "duplicate": true }`
- [ ] No PATCH sent
- [ ] Logs show "Duplicate fingerprint (KV cache)"

**Test**:
```bash
# Manually send duplicate (requires HMAC signature)
# See .artifacts/VERCEL_KV_SETUP.md Step 6 for full example

# Expected response:
# {"ok":true,"changes":0,"diagnostics":[],"warnings":[],"duplicate":true}
```

### 6.4 Verify KV Fingerprint Cache
- [ ] Fingerprint key exists: `wh:fp:{workspace}:{entryId}:{fingerprint}`
- [ ] TTL is 1800 seconds (30 minutes)

**Test**:
```bash
vercel kv keys "wh:fp:*"
# Expected: List of fingerprint keys
```

---

## Phase 7: End-to-End Formula Test ✅

### 7.1 Create Formula
- [ ] Navigate to iframe UI: `https://{vercel-url}/ui/sidebar?auth_token={token}`
- [ ] Create test formula (e.g., "Hours" = `duration / 3600`)
- [ ] Formula saved successfully

**Steps**:
1. Get auth token from `.state/install.json` or iframe URL
2. Open UI in browser
3. Create formula mapping duration to custom field
4. Save and verify no errors

### 7.2 Trigger Formula Evaluation
- [ ] Create/update time entry in Clockify
- [ ] Webhook received and processed
- [ ] Formula evaluated correctly
- [ ] Target custom field updated via PATCH

**Verification**:
```bash
# Check logs for formula evaluation
vercel logs --prod | grep -i "formula\|evaluate\|patch"

# Check time entry in Clockify UI for updated custom field value
```

### 7.3 Verify PATCH Request
- [ ] PATCH sent to `/api/v1/workspaces/{ws}/time-entries/{id}`
- [ ] `X-Addon-Token` header included
- [ ] Custom field values updated
- [ ] Response: 200 OK

**Verification**: Check Vercel logs for PATCH request details

### 7.4 No Duplicate PATCHes
- [ ] Update same time entry again (same values)
- [ ] No PATCH sent (dedupe via fingerprint)
- [ ] Logs show "Duplicate fingerprint"

---

## Phase 8: Backfill Test (PRO Plan Required) ⚠️

### 8.1 Backfill Request
- [ ] POST to `/v1/backfill` with date range
- [ ] Reports API called with `pageSize=200`
- [ ] Entries processed in batches
- [ ] PATCHes sent where formulas apply

**Test**:
```bash
AUTH_TOKEN="<from-install-state>"
curl -X POST $BASE_URL/v1/backfill \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"from":"2025-10-01","to":"2025-10-02"}' | jq .
```

### 8.2 Rate Limiting
- [ ] Rate limiter active (50 RPS default)
- [ ] Backoff on 429 responses
- [ ] Max backoff: 5 seconds

**Verification**: Check logs for "rate limit" or "429" errors

### 8.3 Region Handling
- [ ] `backendUrl` transformed to `reportsUrl`
- [ ] Example: `api.clockify.me` → `reports.api.clockify.me`

**Verification**: Check logs for Reports API URL construction

---

## Phase 9: Error Handling & Logs ✅

### 9.1 No Secrets in Logs
- [ ] JWTs not logged in plaintext
- [ ] API keys redacted or not logged
- [ ] HMAC signatures not logged

**Verification**:
```bash
vercel logs --prod | grep -iE "(bearer|authorization|jwt|hmac)" | head -10
# Verify no full tokens appear
```

### 9.2 Error Responses
- [ ] 401 for invalid JWT/HMAC
- [ ] 403 for unauthorized requests
- [ ] 400 for malformed payloads
- [ ] 500 only for unexpected errors

**Test**: Send invalid requests and verify correct status codes

### 9.3 CORS Headers
- [ ] CORS restricted to Clockify domains
- [ ] `Access-Control-Allow-Origin` includes `app.clockify.me`
- [ ] `developer.clockify.me` allowed in dev

**Verification**:
```bash
curl -H "Origin: https://app.clockify.me" $BASE_URL/manifest -I | grep -i "access-control"
# Expected: Access-Control-Allow-Origin: https://app.clockify.me (or *)
```

---

## Phase 10: Performance & Monitoring ✅

### 10.1 Response Times
- [ ] `/manifest` responds < 500ms
- [ ] `/health` responds < 200ms
- [ ] Webhook processing < 2 seconds (typical)
- [ ] Backfill: ~50 entries/second (with rate limiting)

**Verification**: Check Vercel Analytics dashboard for function duration

### 10.2 KV Metrics
- [ ] KV command count within free tier (100K/month)
- [ ] Storage usage < 10 MB
- [ ] No KV errors in logs

**Verification**:
1. Go to Vercel Dashboard → Storage → xcfe-kv-prod
2. Check Metrics tab
3. Verify usage within limits

### 10.3 Function Invocations
- [ ] Function cold starts < 3 seconds
- [ ] Warm starts < 500ms
- [ ] No timeout errors (10s default limit)

**Verification**: Vercel Dashboard → Analytics → Functions tab

---

## Phase 11: Final Pre-Launch Checklist ✅

### 11.1 Security
- [x] DEV_ALLOW_UNSIGNED production guard active
- [x] HMAC fail-closed (throws if secret missing)
- [x] JWT aud validation active
- [x] JWT nbf validation active
- [x] JWT jti replay cache (KV-backed)
- [x] Persistent webhook dedupe (KV-backed)
- [ ] No secrets committed to git
- [ ] Environment variables secure in Vercel

### 11.2 Reliability
- [x] KV configured and connected
- [x] Fingerprint dedupe persists across restarts
- [ ] Error handling for API failures
- [ ] Rate limiting active
- [ ] Backfill batch processing works

### 11.3 Documentation
- [x] `.artifacts/FINAL_SUMMARY.md` complete
- [x] `.artifacts/DEPLOYMENT_STEPS.md` accurate
- [x] `.artifacts/VERCEL_KV_SETUP.md` created
- [x] `.artifacts/VERIFICATION_CHECKLIST.md` (this file)
- [ ] README.md updated with deployment status
- [ ] `.artifacts/jwt.security.audit.md` reviewed

### 11.4 Git & Release
- [ ] All changes committed
- [ ] Commit message includes security patch details
- [ ] Tag created: `v0.1.0-pilot`
- [ ] Tag pushed to remote

**Commands**:
```bash
git add -A
git commit -m "feat(security): add KV-backed JWT replay + webhook dedupe

- Implement JWT jti replay cache (15 min TTL)
- Replace in-memory dedupe with persistent KV (30 min TTL)
- Add KV env validation (required in production)
- Update doctor script with KV configuration check
- Documentation: VERCEL_KV_SETUP.md, VERIFICATION_CHECKLIST.md

Security: JWT replay protection, persistent dedupe across restarts
Refs: .artifacts/jwt.security.audit.md (HIGH/MEDIUM priority items)"

git tag v0.1.0-pilot
git push origin main --tags
```

---

## Sign-Off

### Deployment Date: `__________`
### Deployed By: `__________`
### Vercel URL: `__________`
### KV Store: `__________`

### Checklist Summary:
- [ ] Phase 1: Environment Setup (7/7)
- [ ] Phase 2: Health Checks (3/3)
- [ ] Phase 3: Security Patches (6/6)
- [ ] Phase 4: Add-on Installation (3/3)
- [ ] Phase 5: JWT Replay Test (4/4)
- [ ] Phase 6: Webhook Dedupe Test (4/4)
- [ ] Phase 7: E2E Formula Test (4/4)
- [ ] Phase 8: Backfill Test (3/3)
- [ ] Phase 9: Error Handling (3/3)
- [ ] Phase 10: Performance (3/3)
- [ ] Phase 11: Final Pre-Launch (13/13)

**Total**: ____ / 53 checks completed

**Status**: [ ] READY FOR PILOT  [ ] NEEDS WORK

**Notes**: ________________________________________________
