# Vercel KV Setup Guide

## Overview

Vercel KV (Key-Value storage) is **required in production** for two critical security features:

1. **JWT Replay Protection** (apps/api/src/lib/jwt.ts:124-135)
   - Prevents reuse of JWT tokens (jti claim tracking)
   - TTL matches JWT expiration time
   - HIGH priority security feature

2. **Persistent Webhook Deduplication** (apps/api/src/controllers/webhookController.ts:28-32)
   - Prevents duplicate PATCH requests after serverless restarts
   - 30-minute TTL for fingerprint cache
   - MEDIUM priority reliability feature

Without KV configured, the production deployment will **fail to boot** with:
```
SECURITY ERROR: KV storage not configured in production.
Set KV_REST_API_URL + KV_REST_API_TOKEN or KV_URL for JWT replay protection and webhook deduplication.
```

## Step 1: Create Vercel KV Store

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project: `clockify-xcfe`
3. Navigate to **Storage** tab
4. Click **Create Database**
5. Select **KV (Redis)**
6. Name: `xcfe-kv-prod`
7. Region: **Same as your function deployment** (e.g., `fra1` for Frankfurt)
8. Click **Create**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Link to your project
vercel link

# Create KV store
vercel kv create xcfe-kv-prod --region fra1
```

## Step 2: Connect KV to Project

After creating the KV store, Vercel will provide three environment variables:

- `KV_REST_API_URL` - REST API endpoint
- `KV_REST_API_TOKEN` - Authentication token
- `KV_URL` - Alternative connection string format

### Via Dashboard

1. In your KV store page, click **Connect to Project**
2. Select `clockify-xcfe` project
3. Select **Production** environment
4. Click **Connect**

This automatically sets the three KV environment variables for production.

### Via CLI

```bash
# Pull the KV credentials
vercel env pull .env.production --environment=production

# Verify KV vars are set
grep -E '^KV_' .env.production
```

Expected output:
```
KV_REST_API_URL=https://xxxxx.upstash.io
KV_REST_API_TOKEN=XXXXXXXXXXXXXXXXXXXXXX
KV_URL=redis://default:XXXXX@xxxxx.upstash.io
```

## Step 3: Verify KV Configuration

### Check Environment Variables

```bash
# Pull production env
vercel env pull .env.production --environment=production

# Verify all KV vars are set
echo "KV_REST_API_URL: $(grep KV_REST_API_URL .env.production | wc -c) chars"
echo "KV_REST_API_TOKEN: $(grep KV_REST_API_TOKEN .env.production | wc -c) chars"
echo "KV_URL: $(grep KV_URL .env.production | wc -c) chars"
```

### Run Doctor Script

```bash
export BASE_URL="https://your-vercel-url.vercel.app"
node scripts/doctor.js
```

Expected output should show:
```
1. Environment Variables
┌─────────────────────────┬────────────────┐
│ (index)                 │ Values         │
├─────────────────────────┼────────────────┤
│ BASE_URL                │ 'set'          │
│ CLOCKIFY_PUBLIC_KEY_PEM │ 'set (XXX)'    │
│ ADDON_KEY               │ 'set'          │
│ WORKSPACE_ID            │ 'set'          │
│ ENCRYPTION_KEY          │ 'set (XXX)'    │
│ KV_CONFIGURED           │ 'YES'          │  ← MUST BE YES
│ KV_REST_API_URL         │ 'set (XXX)'    │
│ KV_REST_API_TOKEN       │ 'set (XXX)'    │
│ KV_URL                  │ 'set (XXX)'    │
└─────────────────────────┴────────────────┘
```

## Step 4: Deploy with KV

```bash
# Deploy to production
vercel --prod

# Wait for deployment to complete
# Verify deployment logs show no KV errors
vercel logs --prod | grep -i "kv\|redis"
```

## Step 5: Test JWT Replay Protection

### Capture a JWT Token

From your Vercel logs, find a lifecycle webhook request:

```bash
# Watch for lifecycle events
vercel logs --prod --follow | grep -i "lifecycle\|jwt"
```

Extract the JWT from the `clockify-signature` or `x-addon-lifecycle-token` header.

### Attempt Replay

```bash
# Save JWT to file
echo "eyJhbGc..." > .artifacts/test-jwt.txt

# First request should succeed
curl -X POST "https://your-vercel-url.vercel.app/v1/lifecycle/installed" \
  -H "clockify-signature: $(cat .artifacts/test-jwt.txt)" \
  -H "Content-Type: application/json" \
  -d '{"workspaceId":"test","addonId":"test"}'

# Second request with SAME JWT should fail with "JWT replay detected"
curl -X POST "https://your-vercel-url.vercel.app/v1/lifecycle/installed" \
  -H "clockify-signature: $(cat .artifacts/test-jwt.txt)" \
  -H "Content-Type: application/json" \
  -d '{"workspaceId":"test","addonId":"test"}'
```

Expected response on replay:
```json
{
  "error": "JWT replay detected: this token has already been used"
}
```

## Step 6: Test Webhook Deduplication

### Send Duplicate Webhook

```bash
# Create test webhook payload
cat > .artifacts/test-webhook.json <<'EOF'
{
  "event": "TIME_ENTRY_UPDATED",
  "workspaceId": "YOUR_WORKSPACE_ID",
  "payload": {
    "id": "test-entry-123",
    "workspaceId": "YOUR_WORKSPACE_ID",
    "userId": "test-user",
    "customFieldValues": []
  }
}
EOF

# Compute HMAC signature
WEBHOOK_SECRET="your-webhook-secret"
SIGNATURE=$(cat .artifacts/test-webhook.json | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print $2}')

# Send first webhook (should process)
curl -X POST "https://your-vercel-url.vercel.app/v1/webhooks/clockify" \
  -H "x-clockify-signature: sha256=$SIGNATURE" \
  -H "x-clockify-event: TIME_ENTRY_UPDATED" \
  -H "Content-Type: application/json" \
  -d @.artifacts/test-webhook.json

# Send duplicate webhook immediately (should skip with duplicate: true)
curl -X POST "https://your-vercel-url.vercel.app/v1/webhooks/clockify" \
  -H "x-clockify-signature: sha256=$SIGNATURE" \
  -H "x-clockify-event: TIME_ENTRY_UPDATED" \
  -H "Content-Type: application/json" \
  -d @.artifacts/test-webhook.json
```

Expected response on duplicate:
```json
{
  "ok": true,
  "changes": 0,
  "diagnostics": [],
  "warnings": [],
  "duplicate": true
}
```

## Troubleshooting

### Error: "KV storage not configured in production"

**Cause**: Missing KV environment variables in production.

**Fix**:
1. Verify KV store created: `vercel kv ls`
2. Connect store to project: Dashboard → Storage → Connect to Project
3. Redeploy: `vercel --prod`

### Error: "KV operation failed"

**Cause**: Invalid KV credentials or network issue.

**Fix**:
1. Check Vercel logs for detailed error: `vercel logs --prod | grep -i "kv\|error"`
2. Verify KV store is active: Dashboard → Storage → xcfe-kv-prod → Status
3. Test KV connectivity: `vercel kv ping`
4. If token expired, regenerate: Dashboard → Storage → xcfe-kv-prod → Settings → Reset Token

### Webhook Duplicates Still Processing

**Cause**: Fingerprint cache not persistent (KV not working or TTL expired).

**Fix**:
1. Verify KV_CONFIGURED=YES in doctor script
2. Check Vercel logs for KV errors: `vercel logs --prod | grep -i "kv operation failed"`
3. Increase TTL if needed (apps/api/src/controllers/webhookController.ts:19)
4. Test with shorter interval (duplicates within 30 min should skip)

### JWT Replay Not Blocking

**Cause**: jti claim missing or KV not storing tokens.

**Fix**:
1. Verify JWT contains `jti` claim: `node -e "console.log(JSON.parse(Buffer.from('PAYLOAD'.split('.')[1], 'base64url')))"`
2. Check KV logs: `vercel logs --prod | grep -i "jti\|replay"`
3. Verify JWT exp is in future (TTL must be > 0)
4. Test with same JWT within expiry window

## KV Data Schema

### JWT Replay Cache

**Key Format**: `jti:{jti_value}`
**Value**: `"1"` (string)
**TTL**: JWT expiry time - current time (seconds)
**Example**: `jti:a1b2c3d4` → `"1"` (TTL: 900s)

### Webhook Fingerprint Cache

**Key Format**: `wh:fp:{workspaceId}:{entryId}:{fingerprint}`
**Value**: `"1"` (string)
**TTL**: 1800 seconds (30 minutes)
**Example**: `wh:fp:64abc:entry123:sha256hash` → `"1"` (TTL: 1800s)

## Performance Considerations

- **KV Region**: Must match function deployment region for low latency
- **TTL Strategy**: Short TTLs (15-30 min) minimize storage costs
- **Fail-Open Policy**: KV errors log warnings but don't block requests (see apps/api/src/lib/kv.ts:24-27)
- **Development Mode**: KV optional in dev, falls back to no caching (apps/api/src/lib/kv.ts:20-23)

## Cost Estimate

Vercel KV pricing (as of 2025):
- **Free tier**: 256 MB storage, 100K commands/month
- **Pro tier**: 1 GB storage, 10M commands/month ($5/month)

Estimated usage for xCFE:
- JWT replay: ~50 KB/day (100 tokens × 500 bytes × TTL factor)
- Webhook dedupe: ~100 KB/day (200 webhooks × 500 bytes × TTL factor)
- **Total**: ~150 KB/day = 4.5 MB/month → **Free tier sufficient for pilot**

## Next Steps

1. ✅ Create Vercel KV store
2. ✅ Connect to production project
3. ✅ Verify KV_CONFIGURED=YES in doctor script
4. ✅ Deploy with `vercel --prod`
5. ✅ Test JWT replay protection
6. ✅ Test webhook deduplication
7. 📋 Monitor KV usage: Dashboard → Storage → xcfe-kv-prod → Metrics
8. 📋 Set up alerts for KV errors (optional)
