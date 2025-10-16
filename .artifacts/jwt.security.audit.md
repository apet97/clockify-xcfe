# JWT & Security Audit

## JWT Verification (apps/api/src/lib/jwt.ts)

### Clockify JWT Verification Flow
1. getClockifyPublicKey() - Loads RSA_PUBLIC_KEY_PEM from env
2. jwtVerify() with RS256 algorithm
3. validateClockifyClaims() checks:
   - type === 'addon'
   - iss === 'clockify'
   - sub === expectedSub (addon key)
   - addonId, workspaceId present
   - backendUrl present (if requireBackendUrl=true)

### Claims Validated
- iss (issuer): 'clockify'
- sub (subject): addon key
- type: 'addon'
- addonId, workspaceId (required)
- backendUrl (optional based on requireBackendUrl parameter)
- exp, iat (standard JWT expiry)

### Claims NOT Validated
❌ jti (JWT ID) - No replay cache observed
❌ nbf (not before) - Not explicitly checked
❌ aud (audience) - Not validated against expected audience

### Dev Bypass Mechanisms
- DEV_ALLOW_UNSIGNED env var bypasses signature verification
- developer.clockify.me backendUrl allows decode-only verification
- Fallback to decodeClockifyClaims() on verification failure

## Webhook HMAC Verification (apps/api/src/lib/webhookSecurity.ts)

### verifyClockifySignature()
1. Parses clockify-signature header (format: sha256=<hex>)
2. Computes HMAC-SHA256 with CLOCKIFY_WEBHOOK_SECRET
3. timing-safe comparison via timingSafeEqual()

### Security Issues
❌ Returns TRUE if CLOCKIFY_WEBHOOK_SECRET is not set
✅ timingSafeEqual implementation correctly prevents timing attacks
❌ DEV_ALLOW_UNSIGNED in development mode bypasses HMAC entirely

## Dedupe/Idempotency (apps/api/src/controllers/webhookController.ts)

### Fingerprint-Based Dedupe
- createHash('sha256').update(JSON.stringify(diff)).digest('hex')
- patchFingerprintCache: Map<string, {fingerprint, timestamp}>
- shouldSkipFingerprint() checks if same fingerprint seen within TTL
- TTL: 5 minutes (300000 ms)

### Implementation
- Per-entry fingerprint: `${workspaceId}:${entryId}`
- In-memory Map (lost on restart)
- No JTI replay cache for lifecycle/webhook JWTs

## Rate Limiting
- rateLimiter.schedule() wraps all Clockify API calls
- Per-workspace key rate limiting
- RateLimitError thrown on 429 status
- Retry-After header parsed for backoff

## Region/Host Derivation
- JWT claims: backendUrl, reportsUrl
- buildBaseUrl() - env CLOCKIFY_REGION or CLOCKIFY_BASE_URL
- buildReportsBaseUrl() - transforms api.clockify.me → reports.api.clockify.me
- baseUrlOverride parameter threads through all API calls

## Security Risks

| Risk | Severity | Location |
|------|----------|----------|
| No JTI replay cache | High | jwt.ts:116 - verifyClockifyJwt |
| No aud validation | Medium | jwt.ts:94 - validateClockifyClaims |
| Weak HMAC fallback | High | webhookSecurity.ts:6 - returns true if secret missing |
| In-memory dedupe cache | Medium | webhookController.ts:19 - lost on restart |
| DEV_ALLOW_UNSIGNED in prod | Critical | jwt.ts:118, webhookSecurity.ts:5 |
| No nbf validation | Low | jwt.ts - not enforced |

## Recommendations

1. **JWT Replay Protection**
   - Add jti-based replay cache with Redis/DB
   - TTL = exp - now (match JWT expiry)
   - Block duplicate jti within window

2. **Audience Validation**
   - Validate aud claim === CONFIG.ADDON_KEY
   - Prevents token reuse across add-ons

3. **HMAC Hardening**
   - Fail closed: return false if CLOCKIFY_WEBHOOK_SECRET missing
   - Remove DEV_ALLOW_UNSIGNED in production builds

4. **Persistent Dedupe**
   - Move fingerprint cache to Redis/DB
   - Survive restarts and horizontal scaling

5. **nbf Enforcement**
   - Validate nbf <= now in validateClockifyClaims()
   - Prevent premature token use
