# Minimal Security & Robustness Patches

## 1. JWT Replay Protection (HIGH)
**File**: apps/api/src/lib/jwt.ts
**Line**: 116 (verifyClockifyJwt function)
**Issue**: No jti-based replay cache
**Fix**:
```typescript
// Add before returning claims in verifyClockifyJwt()
const jti = claims.jti;
if (jti && await isJtiSeen(jti)) {
  throw new Error('JWT replay detected: jti already used');
}
if (jti) {
  const ttl = claims.exp - Math.floor(Date.now() / 1000);
  await rememberJti(jti, ttl);
}
```
**Dependencies**: Implement Redis/DB-backed isJtiSeen() and rememberJti()

## 2. Audience Validation (MEDIUM)
**File**: apps/api/src/lib/jwt.ts
**Line**: 94 (validateClockifyClaims function)
**Issue**: No aud claim validation
**Fix**:
```typescript
if (claims.aud && claims.aud !== CONFIG.ADDON_KEY) {
  throw new Error(`Invalid JWT audience, expected "${CONFIG.ADDON_KEY}", got "${claims.aud}"`);
}
```

## 3. HMAC Hardening (HIGH)
**File**: apps/api/src/lib/webhookSecurity.ts
**Line**: 6
**Issue**: Returns true if CLOCKIFY_WEBHOOK_SECRET missing
**Fix**:
```typescript
export const verifyClockifySignature = (rawBody: string, signatureHeader?: string | null): boolean => {
  if (CONFIG.DEV_ALLOW_UNSIGNED && CONFIG.NODE_ENV === 'development') return true;
  if (!CONFIG.CLOCKIFY_WEBHOOK_SECRET) {
    throw new Error('CLOCKIFY_WEBHOOK_SECRET not configured');
  }
  // ... rest of function
};
```

## 4. Persistent Dedupe Cache (MEDIUM)
**File**: apps/api/src/controllers/webhookController.ts
**Line**: 19 (patchFingerprintCache)
**Issue**: In-memory Map lost on restart
**Fix**: Replace Map with Redis/DB-backed cache
```typescript
const shouldSkipFingerprint = async (key: string, fingerprint: string) => {
  const record = await redisClient.get(`fingerprint:${key}`);
  if (!record) return false;
  const { fingerprint: cached, timestamp } = JSON.parse(record);
  if (Date.now() - timestamp > FINGERPRINT_TTL_MS) {
    await redisClient.del(`fingerprint:${key}`);
    return false;
  }
  return cached === fingerprint;
};
```

## 5. Remove DEV_ALLOW_UNSIGNED in Production (CRITICAL)
**File**: apps/api/src/config/env.ts
**Issue**: DEV_ALLOW_UNSIGNED can leak to production
**Fix**: Add runtime guard
```typescript
if (CONFIG.DEV_ALLOW_UNSIGNED && CONFIG.NODE_ENV === 'production') {
  throw new Error('DEV_ALLOW_UNSIGNED must not be enabled in production');
}
```

## 6. nbf Validation (LOW)
**File**: apps/api/src/lib/jwt.ts
**Line**: 94 (validateClockifyClaims)
**Issue**: nbf (not before) not validated
**Fix**:
```typescript
if (claims.nbf && claims.nbf > Math.floor(Date.now() / 1000)) {
  throw new Error('JWT not yet valid (nbf claim in future)');
}
```

## 7. Admin UI Token in Header (MEDIUM)
**File**: apps/admin-ui/src/utils/api.ts
**Line**: 23
**Issue**: auth_token transmitted in URL query
**Fix**: Use X-Addon-Token header instead
```typescript
const headers: HeadersInit = {
  'Content-Type': 'application/json'
};
const iframeToken = new URLSearchParams(window.location.search).get('auth_token');
if (iframeToken) {
  headers['X-Addon-Token'] = iframeToken;
}
// Remove auth_token from URL searchParams
```

## 8. Manifest Endpoint Health Check
**File**: apps/api/src/controllers/manifestController.ts
**Issue**: /manifest endpoint returns FUNCTION_INVOCATION_FAILED
**Fix**: Investigate server.ts routing and ensure /manifest or /manifest.json resolves correctly
**Verify**: curl https://BASE_URL/manifest should return JSON

## Summary

| Priority | Count | Effort |
|----------|-------|--------|
| Critical | 1 | Low |
| High | 2 | Medium |
| Medium | 3 | Medium-High |
| Low | 1 | Low |

**Next Steps**:
1. Set up Redis/DB for jti replay cache and fingerprint cache
2. Add runtime guards for DEV_ALLOW_UNSIGNED
3. Implement aud and nbf validation
4. Move admin UI auth_token to headers
5. Debug /manifest endpoint 500 error
