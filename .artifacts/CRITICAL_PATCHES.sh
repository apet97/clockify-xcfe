#!/bin/bash
# Critical Security Patches Implementation

echo "=== Critical Security Patches for xCFE ==="
echo ""
echo "This script creates patch files. Apply manually after review."
echo ""

# Patch 1: Runtime guard for DEV_ALLOW_UNSIGNED in production
cat > .artifacts/patch1-dev-guard.diff <<'PATCH'
--- a/apps/api/src/config/env.ts
+++ b/apps/api/src/config/env.ts
@@ -127,6 +127,12 @@ if (!parsed.success) {
 
 const env = parsed.data;
 
+// CRITICAL: Prevent DEV_ALLOW_UNSIGNED in production
+if (env.NODE_ENV === 'production' && env.DEV_ALLOW_UNSIGNED) {
+  throw new Error('SECURITY ERROR: DEV_ALLOW_UNSIGNED must not be enabled in production environment');
+}
+
 export type Env = typeof env;
 
 export const CONFIG = env;
PATCH

echo "✓ Created patch1-dev-guard.diff"

# Patch 2: Fail-closed HMAC verification
cat > .artifacts/patch2-hmac-hardening.diff <<'PATCH'
--- a/apps/api/src/lib/webhookSecurity.ts
+++ b/apps/api/src/lib/webhookSecurity.ts
@@ -3,7 +3,9 @@ import { CONFIG } from '../config/index.js';
 
 export const verifyClockifySignature = (rawBody: string, signatureHeader?: string | null): boolean => {
   if (CONFIG.DEV_ALLOW_UNSIGNED && CONFIG.NODE_ENV === 'development') return true;
-  if (!CONFIG.CLOCKIFY_WEBHOOK_SECRET) return true;
+  if (!CONFIG.CLOCKIFY_WEBHOOK_SECRET) {
+    throw new Error('CLOCKIFY_WEBHOOK_SECRET is required for webhook signature verification');
+  }
   if (!signatureHeader) return false;
   const [scheme, signature] = signatureHeader.split('=', 2);
   if (!scheme || !signature || scheme !== 'sha256') return false;
PATCH

echo "✓ Created patch2-hmac-hardening.diff"

# Patch 3: Add aud claim validation
cat > .artifacts/patch3-aud-validation.diff <<'PATCH'
--- a/apps/api/src/lib/jwt.ts
+++ b/apps/api/src/lib/jwt.ts
@@ -94,6 +94,10 @@ const validateClockifyClaims = (claims: ClockifyJwtClaims, expectedSub?: string
   if (claims.type !== 'addon') {
     throw new Error('Invalid JWT type, expected "addon"');
   }
+  
+  if (claims.aud && claims.aud !== CONFIG.ADDON_KEY) {
+    throw new Error(`Invalid JWT audience, expected "${CONFIG.ADDON_KEY}", got "${claims.aud}"`);
+  }
 
   if (claims.iss !== 'clockify') {
     throw new Error(`Invalid JWT issuer, expected "clockify", got "${claims.iss || ''}"`);
PATCH

echo "✓ Created patch3-aud-validation.diff"

# Patch 4: Add nbf validation
cat > .artifacts/patch4-nbf-validation.diff <<'PATCH'
--- a/apps/api/src/lib/jwt.ts
+++ b/apps/api/src/lib/jwt.ts
@@ -102,6 +102,10 @@ const validateClockifyClaims = (claims: ClockifyJwtClaims, expectedSub?: string
     throw new Error(`Invalid JWT issuer, expected "clockify", got "${claims.iss || ''}"`);
   }
 
+  if (claims.nbf && claims.nbf > Math.floor(Date.now() / 1000)) {
+    throw new Error('JWT not yet valid (nbf claim in future)');
+  }
+
   if (expectedSub && claims.sub !== expectedSub) {
     throw new Error(`Invalid JWT subject, expected "${expectedSub}", got "${claims.sub}"`);
   }
PATCH

echo "✓ Created patch4-nbf-validation.diff"

echo ""
echo "=== Patches Created ==="
echo "Apply with:"
echo "  cd /Users/15x/Downloads/xCustomFieldExpander/clockify-xcfe"
echo "  patch -p1 < .artifacts/patch1-dev-guard.diff"
echo "  patch -p1 < .artifacts/patch2-hmac-hardening.diff"
echo "  patch -p1 < .artifacts/patch3-aud-validation.diff"
echo "  patch -p1 < .artifacts/patch4-nbf-validation.diff"
echo ""
echo "⚠️ HIGH PRIORITY REMAINING:"
echo "  - JWT jti replay cache (requires Redis/KV/DB)"
echo "  - Persistent fingerprint dedupe cache (requires Redis/KV/DB)"
