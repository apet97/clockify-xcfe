# xCFE Deployment Steps - Execute in Order

## Status
✅ Critical security patches applied:
1. DEV_ALLOW_UNSIGNED production guard (env.ts:130-133)
2. HMAC fail-closed (webhookSecurity.ts:6-8)
3. JWT aud validation (jwt.ts:99-101)
4. JWT nbf validation (jwt.ts:107-109)
5. JWT jti replay cache with KV (jwt.ts:124-135) ⭐ NEW
6. Persistent webhook dedupe with KV (webhookController.ts:28-32) ⭐ NEW

✅ Vercel KV integration added:
- @vercel/kv dependency added
- KV required in production (env.ts:139-151)
- Doctor script checks KV configuration

⚠️ Deployment requires: ENCRYPTION_KEY + KV setup

## STEP 1: Set Production Environment Variables

### Required Now (Fix 500s)
```bash
# Generate and set ENCRYPTION_KEY
openssl rand -base64 48 | vercel env add ENCRYPTION_KEY production

# Set SKIP_DATABASE_CHECKS (no Postgres in serverless)
echo "true" | vercel env add SKIP_DATABASE_CHECKS production

# Set ADDON_KEY
echo "xcfe-custom-field-expander" | vercel env add ADDON_KEY production
```

### Get CLOCKIFY_PUBLIC_KEY_PEM
1. Go to https://developer.clockify.me
2. Find your add-on settings
3. Copy RSA Public Key (-----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----)
4. Set in Vercel:
```bash
# Save to file first
cat > /tmp/clockify.pem
# Paste PEM, press Ctrl+D
vercel env add CLOCKIFY_PUBLIC_KEY_PEM production < /tmp/clockify.pem
rm /tmp/clockify.pem
```

### Set Workspace Specific Vars
```bash
# Your Clockify workspace ID
echo "YOUR_WORKSPACE_ID" | vercel env add WORKSPACE_ID production

# Generate webhook secret
openssl rand -hex 32 | vercel env add CLOCKIFY_WEBHOOK_SECRET production

# Generate admin secret
openssl rand -base64 32 | vercel env add ADMIN_SECRET production
```

## STEP 1.5: Create and Connect Vercel KV Store ⭐ REQUIRED

### Why KV is Required
KV (Key-Value storage) is **mandatory in production** for:
1. **JWT Replay Protection** - Prevents token reuse attacks (HIGH priority)
2. **Persistent Webhook Dedupe** - Prevents duplicate PATCHes after restarts (MEDIUM priority)

Without KV, deployment will fail with:
```
SECURITY ERROR: KV storage not configured in production.
```

### Create KV Store

**Via Vercel Dashboard** (Recommended):
1. Go to https://vercel.com/dashboard
2. Select project `clockify-xcfe`
3. Navigate to **Storage** tab
4. Click **Create Database** → **KV (Redis)**
5. Name: `xcfe-kv-prod`
6. Region: Same as function deployment (e.g., `fra1`)
7. Click **Create**
8. Click **Connect to Project** → Select `clockify-xcfe` → **Production** → **Connect**

**Via CLI**:
```bash
# Create KV store
vercel kv create xcfe-kv-prod --region fra1

# Link to project (automatic if created via dashboard)
vercel env pull .env.production --environment=production

# Verify KV vars set
grep -E '^KV_' .env.production
# Expected: KV_REST_API_URL, KV_REST_API_TOKEN, KV_URL
```

**Verification**:
```bash
# Check KV store exists
vercel kv ls
# Expected: xcfe-kv-prod listed

# Test KV connection
vercel kv ping
# Expected: PONG
```

📖 **Detailed KV setup guide**: `.artifacts/VERCEL_KV_SETUP.md`

## STEP 2: Deploy to Production
```bash
cd /Users/15x/Downloads/xCustomFieldExpander/clockify-xcfe
vercel --prod
```

Wait for deployment to complete. Note the deployment URL.

## STEP 3: Run Doctor Script
```bash
export BASE_URL="<your-vercel-url>"
node scripts/doctor.js | tee .artifacts/doctor-post-deploy.txt
```

Expected output:
- ✓ Manifest reachable (200)
- ✓ Health check OK (200)
- ✓ All lifecycle GET probes return 200
- ✓ KV_CONFIGURED = YES

## STEP 4: Update Manifest in Developer Portal
1. Go to https://developer.clockify.me
2. Navigate to your add-on
3. Set Manifest URL: `https://<your-vercel-url>/manifest`
4. Save and validate

## STEP 5: Install Add-on on Test Workspace

### Option A: Via CLI (if scripts/cli.ts has install command)
```bash
pnpm run cli install:wait
pnpm run cli install:status | tee .artifacts/install.status.txt
```

### Option B: Via Clockify UI
1. Go to workspace settings
2. Navigate to Add-ons / Marketplace
3. Find "xCustom Field Expander"
4. Click Install
5. Verify lifecycle webhook fires:
```bash
# Check .state/install.json was created
cat .state/install.json
```

## STEP 6: Verify Webhook Flow

### Create Test Time Entry
1. In Clockify, create a new time entry
2. Update a custom field
3. Check Vercel logs for webhook ingestion:
```bash
vercel logs --prod | grep -E "(webhook|TIME_ENTRY)"
```

Expected flow:
1. Webhook received → HMAC verified
2. getTimeEntry called → formula evaluated
3. Diff computed → fingerprint checked
4. PATCH sent (if changed)

### Save Webhook JWT for Testing
From Vercel logs, find a `clockify-signature` header value:
```bash
echo "<JWT>" > .artifacts/webhook.jwt
```

Verify:
```bash
# Use CLI if available
pnpm run cli jwt:webhook:verify --file .artifacts/webhook.jwt

# Or decode manually
node -e "console.log(JSON.parse(Buffer.from('$(cat .artifacts/webhook.jwt | cut -d. -f2)', 'base64url')))" | jq .
```

## STEP 7: Test Backfill (PRO Plan Required)

```bash
export AUTH_TOKEN="<from .state/install.json or iframe URL>"

curl -sS -X POST "$BASE_URL/v1/backfill" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"from":"2025-10-01","to":"2025-10-02"}' | jq .
```

Expected:
- Reports API called (pageSize=200)
- Entries processed
- PATCHes sent where formulas apply

## STEP 8: Create Test Formula

1. Navigate to iframe UI: `https://<vercel-url>/ui/sidebar?auth_token=<token>`
2. Create a formula:
   - Name: "Test Hours"
   - Input field: "Duration"
   - Formula: `duration / 3600`
   - Target field: "Calculated Hours"
3. Save formula
4. Create/update time entry → verify target field updates

## STEP 9: Verify Dedupe

```bash
# If CLI has dedupe test
pnpm run cli webhook:test:dedupe --event-file ./fixtures/time_entry_updated.json

# Or manually: send same webhook twice
curl -X POST "$BASE_URL/v1/webhooks/clockify" \
  -H "clockify-signature: sha256=<signature>" \
  -H "Content-Type: application/json" \
  -d @fixtures/time_entry_updated.json

# Repeat same request → should see "Duplicate fingerprint" in logs
```

## STEP 10: Security Verification Checklist

- [ ] DEV_ALLOW_UNSIGNED=false in production env
- [ ] CLOCKIFY_WEBHOOK_SECRET set and HMAC verification works
- [ ] JWT aud claim validated
- [ ] JWT nbf claim validated
- [ ] JWT jti replay protection active (KV-backed) ⭐ NEW
- [ ] Webhook dedupe persistent (KV-backed) ⭐ NEW
- [ ] KV_CONFIGURED=YES in doctor output
- [ ] No secrets in logs (check Vercel logs)
- [ ] CORS restricted to Clockify domains
- [ ] CSP headers present in UI responses

**Test JWT Replay**:
```bash
# Capture JWT from lifecycle webhook
vercel logs --prod | grep -oE "eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+" | head -1 > .artifacts/test-jwt.txt

# First request should succeed
curl -X POST "$BASE_URL/v1/lifecycle/installed" \
  -H "clockify-signature: $(cat .artifacts/test-jwt.txt)" \
  -d '{"workspaceId":"test","addonId":"test"}'

# Second request should fail with "JWT replay detected"
curl -X POST "$BASE_URL/v1/lifecycle/installed" \
  -H "clockify-signature: $(cat .artifacts/test-jwt.txt)" \
  -d '{"workspaceId":"test","addonId":"test"}'
```

📖 **Full test procedures**: `.artifacts/VERIFICATION_CHECKLIST.md` (53 checks)

## STEP 11: Review Artifacts and TODOs

```bash
# Open security audit
cat .artifacts/jwt.security.audit.md

# Review patch recommendations
cat .artifacts/repo-todos.patch.md

# Check endpoint inventory
cat .artifacts/endpoints.map.md

# Review Reports usage
cat .artifacts/reports.backfill.notes.md
```

## STEP 12: Tag Release

```bash
git add -A
git commit -m "feat(security): add KV-backed JWT replay + webhook dedupe

- Implement JWT jti replay cache (15 min TTL) in jwt.ts
- Replace in-memory dedupe with persistent KV (30 min TTL) in webhookController.ts
- Add @vercel/kv dependency to package.json
- Enforce KV configuration in production (env.ts)
- Update doctor script with KV checks
- Add DEV_ALLOW_UNSIGNED production guard
- Fail-closed HMAC verification
- Validate JWT aud and nbf claims
- Fix 500s via ENCRYPTION_KEY and SKIP_DATABASE_CHECKS

Security: JWT replay protection, persistent dedupe across restarts
Refs: .artifacts/jwt.security.audit.md (HIGH/MEDIUM priority items)
Docs: .artifacts/VERCEL_KV_SETUP.md, .artifacts/VERIFICATION_CHECKLIST.md"

git tag v0.1.0-pilot
git push origin main --tags
```

## STEP 13: Final Verification

```bash
# Re-run doctor
node scripts/doctor.js

# Test E2E flow
# 1. Create time entry with custom field
# 2. Verify formula applied
# 3. Update same entry
# 4. Verify dedupe (no duplicate PATCH)
# 5. Save entry JSON to .artifacts/e2e-proof.json
```

## Troubleshooting

### Manifest still returns 500
- Check Vercel logs: `vercel logs --prod | grep -E "(error|Error|500)"`
- Verify ENCRYPTION_KEY is set: `vercel env ls production | grep ENCRYPTION_KEY`
- Check config validation error in logs

### Webhook 401 Unauthorized
- Verify CLOCKIFY_WEBHOOK_SECRET matches Clockify settings
- Check `clockify-signature` header present
- Review HMAC computation in logs

### JWT Verification Failed
- Verify CLOCKIFY_PUBLIC_KEY_PEM includes BEGIN/END lines
- Check PEM format (no extra whitespace)
- Confirm JWT iss=clockify, type=addon

### No PATCH Sent
- Check formula matches custom field types
- Verify diff computed (check logs)
- Ensure fingerprint not duplicate
- Confirm X-Addon-Token present in PATCH request

### KV Connection Failed
- Verify KV store created: `vercel kv ls`
- Check KV credentials: `grep KV_ .env.production`
- Test connectivity: `vercel kv ping`
- View KV logs: `vercel logs --prod | grep -i "kv\|redis"`
- If token expired, regenerate in Dashboard → Storage → Settings

### Deployment Still Returns 500 After Setting Env Vars
- Verify ENCRYPTION_KEY set: `vercel env ls production | grep ENCRYPTION_KEY`
- Verify KV_CONFIGURED in doctor output
- Check all required vars: `node scripts/doctor.js`
- Review deployment logs: `vercel logs --prod | grep -E "(error|Error|500|SECURITY ERROR)"`
