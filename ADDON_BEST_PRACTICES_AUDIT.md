# Clockify Add-on Best Practices Audit

**Project:** xCustom Field Expander (xCFE)
**Date:** 2025-10-16
**Auditor:** Claude Code
**Sources:** Official Clockify Add-on Guides, CAKE.com Marketplace Documentation

---

## Executive Summary

This audit compares the xCFE add-on implementation against official Clockify add-on best practices from the comprehensive guides in the `newyork/` folder. The analysis covers manifest structure, authentication, lifecycle events, webhooks, settings management, and security.

**Overall Status:** ✅ STRONG - Implementation follows most best practices with some areas for improvement

---

## 1. Manifest Structure

### ✅ COMPLIANT Areas:

1. **Schema Version**
   - ✅ Uses schema version 1.3 (current standard per guides)
   - Location: `infra/manifest.json:2`

2. **Required Fields Present**
   - ✅ `schemaVersion`, `name`, `slug` defined
   - ✅ `scopes` array properly structured
   - ✅ Includes comprehensive scope list: TIME_ENTRY_READ/WRITE, USER_READ, PROJECT_READ, etc.

3. **Add-on Metadata**
   - ✅ Clear `summary` and `description`
   - ✅ `minimalSubscriptionPlan: "PRO"` defined
   - ✅ Support information included (email, documentation, SLA)

### ⚠️ RECOMMENDATIONS:

1. **Missing Standard Fields**
   ```diff
   + Add "key" field (required by Clockify - unique addon identifier)
   + Add "baseUrl" field (required - base for all component/webhook paths)
   + Add "components" array for UI integration points (sidebar, tabs, etc.)
   + Add "lifecycle" object with event endpoints
   + Add "webhooks" array with proper event definitions
   ```

2. **Authentication Strategy**
   - Current: Custom authentication strategies object
   - Guide says: Use standard Clockify token model (User Token in iframe, Installation Token in lifecycle)
   - **Recommendation:** Remove custom `authentication.strategies` and rely on Clockify's default token injection

3. **URL Structure**
   - Current: `iframeUrl` and `webhookUrl` as top-level fields
   - Guide says: Should use `baseUrl` + relative paths in `components` and `webhooks` arrays
   - **Example from guide:**
     ```json
     {
       "baseUrl": "https://your-addon-server.com",
       "components": [{
         "type": "sidebar.page",
         "label": "xCFE",
         "path": "/ui/sidebar",
         "accessLevel": "EVERYONE"
       }],
       "webhooks": [{
         "event": "TIME_ENTRY_UPDATED",
         "path": "/v1/webhooks/clockify"
       }]
     }
     ```

### 📋 RECOMMENDED MANIFEST STRUCTURE:

```json
{
  "schemaVersion": "1.3",
  "key": "xcfe-custom-field-expander",
  "name": "xCustom Field Expander",
  "baseUrl": "https://your-vercel-domain.vercel.app",
  "description": "Automated formula evaluation and validation for Clockify custom fields",
  "subscriptionPlan": "PRO",
  "scopes": [
    "TIME_ENTRY_READ",
    "TIME_ENTRY_WRITE",
    "USER_READ",
    "PROJECT_READ",
    "TASK_READ",
    "CUSTOM_FIELDS_READ",
    "REPORTS_READ"
  ],
  "components": [
    {
      "type": "sidebar.page",
      "label": "Field Expander",
      "path": "/ui/sidebar",
      "accessLevel": "ADMINS"
    }
  ],
  "settings": {
    "type": "STRUCTURED",
    "path": "/lifecycle/settings-updated",
    "properties": [
      {
        "key": "strict_mode",
        "label": "Strict Mode",
        "type": "CHECKBOX",
        "required": false,
        "hint": "Enable strict validation for all formulas"
      },
      {
        "key": "reference_months",
        "label": "Reference Months",
        "type": "NUMBER",
        "required": false,
        "hint": "Number of months to consider for overtime calculations"
      }
    ]
  },
  "lifecycle": {
    "installed": {
      "method": "POST",
      "path": "/lifecycle/installed"
    },
    "statusChanged": {
      "method": "POST",
      "path": "/lifecycle/status-changed"
    },
    "settingsUpdated": {
      "method": "POST",
      "path": "/lifecycle/settings-updated"
    },
    "deleted": {
      "method": "POST",
      "path": "/lifecycle/deleted"
    }
  },
  "webhooks": [
    {
      "event": "TIME_ENTRY_UPDATED",
      "path": "/v1/webhooks/clockify",
      "webhookType": "ADDON"
    },
    {
      "event": "TIME_ENTRY_CREATED",
      "path": "/v1/webhooks/clockify",
      "webhookType": "ADDON"
    }
  ]
}
```

---

## 2. JWT Authentication & Token Handling

### ✅ EXCELLENT Implementation:

1. **RSA256 Signature Verification**
   - ✅ Uses jose library with proper RS256 algorithm validation
   - ✅ Imports SPKI key correctly from PEM format
   - Location: `apps/api/src/lib/jwt.ts:77-92`

2. **Claims Validation**
   - ✅ Validates `iss === 'clockify'` (jwt.ts:104)
   - ✅ Validates `type === 'addon'` (jwt.ts:96)
   - ✅ Validates `sub` against ADDON_KEY (jwt.ts:112-114)
   - ✅ Validates `nbf` (not-before) claim (jwt.ts:108-110)
   - ✅ Checks `backendUrl` presence when required (jwt.ts:120-122)

3. **Token Types**
   - ✅ Properly distinguishes Installation Token vs User Token
   - ✅ Installation Token stored per workspace in memory
   - ✅ User Token extracted from iframe query params (`auth_token`)

4. **JWT Replay Protection**
   - ✅ Implements JTI (JWT ID) replay detection using KV cache
   - ✅ Stores seen JWTs with TTL matching token expiry
   - Location: `jwt.ts:124-135`

### ⚠️ RECOMMENDATIONS:

1. **Webhook Signature Verification**
   ```typescript
   // Current: webhookSecurity.ts uses HMAC with shared secret
   // Guide says: Webhooks have JWT in "clockify-signature" header
   ```

   **From Guide (ADDON GUIDE 2:205-207):**
   > "Each request includes headers: **`clockify-signature`** (JWT), **`clockify-webhook-event-type`**"
   > "Verify with Clockify **public key**, check **`iss = "clockify"`** and **`sub = your addon key`**"

   **Recommendation:** Update webhook handler to verify JWT signature instead of HMAC:
   ```typescript
   // In webhookController.ts:74
   const signature = req.header('clockify-signature'); // JWT, not HMAC
   const claims = await verifyClockifyJwt(signature);
   // Verify claims.sub === CONFIG.ADDON_KEY
   ```

2. **Store Webhook Tokens from Installation**
   - Guide says: Installation payload includes unique `authToken` per webhook
   - **Quote:** "The **same webhook token** is re-used; you also receive webhook tokens in the **installed** payload—**store them** to compare"
   - Current implementation doesn't store/compare these specific webhook tokens

### 🔒 SECURITY STRENGTH:

- **Grade: A+** for JWT verification
- Properly validates all required claims
- Implements replay protection
- Only weakness: webhook signature uses HMAC instead of JWT verification

---

## 3. Lifecycle Events

### ✅ COMPLIANT Implementation:

1. **All Required Events Handled**
   - ✅ `INSTALLED` - apps/api/src/controllers/lifecycleController.ts:42
   - ✅ `STATUS_CHANGED` - lifecycleController.ts:81
   - ✅ `SETTINGS_UPDATED` - lifecycleController.ts:125
   - ✅ `DELETED` - lifecycleController.ts:215

2. **Token Verification**
   - ✅ Extracts token from `x-addon-lifecycle-token` OR `clockify-signature` header
   - ✅ Calls `verifyClockifyJwt()` with proper validation
   - ✅ Returns 401 on verification failure
   - Location: lifecycleController.ts:22-40

3. **Installation Token Storage**
   - ✅ Stores `authToken` from installation payload (if db enabled)
   - ✅ Falls back to in-memory storage via `installMemory.ts`
   - ✅ Persists backendUrl extracted from JWT
   - Location: `services/installationService.ts`, `services/installMemory.ts`

4. **DEV_ALLOW_UNSIGNED Support**
   - ✅ Allows development testing without real tokens
   - ✅ Protected by environment check (cannot be enabled in production)
   - Location: env.ts:145-148

### 📊 COMPARISON TO GUIDE EXAMPLES:

**Guide Example (newYork/handlers.py:27-53):**
```python
@router.post("/installed")
async def installed(
    clockify_signature: Optional[str] = Header(None),
    x_addon_lifecycle_token: Optional[str] = Header(None),
):
    token = _get_signature_token(clockify_signature, x_addon_lifecycle_token)
    auth.verify_request_signature(token)

    data = await request.json()
    workspace_id = data.get("workspaceId")
    installation_token_jwt = data.get("authToken")

    # Decode installation token for backendUrl
    token_claims = auth.verify_clockify_token(installation_token_jwt)
    backend_url = token_claims.get("backendUrl")

    installation_tokens[workspace_id] = {
        "token": installation_token_jwt,
        "backendUrl": backend_url
    }
```

**Our Implementation:** ✅ MATCHES - Same pattern, same validation flow

---

## 4. Dynamic Endpoint Resolution

### ✅ EXCELLENT - Follows Best Practice:

**Guide Quote (ADDON GUIDE 2:176-177):**
> "Never hard-code API hosts. Decode the JWT claims and use the URL claims (**`backendUrl`, `reportsUrl`, `locationsUrl`, `screenshotsUrl`**)"

### Our Implementation:

1. **clockifyAuth.ts** (recently added)
   - ✅ Extracts `backendUrl` from JWT claims
   - ✅ Uses dynamic URLs for all API calls
   - Location: apps/api/src/lib/clockifyAuth.ts:124-133

2. **clockifyClient.ts**
   - ✅ Accepts `baseUrlOverride` parameter
   - ✅ Uses JWT `backendUrl` when available
   - ✅ Falls back to CLOCKIFY_BASE_URL only if needed
   - Example: `getTimeEntry(workspaceId, entryId, correlationId, authToken, baseOverride)`

3. **Installation Memory**
   - ✅ Stores `backendUrl` per workspace from installation token
   - ✅ Retrieved and used for all workspace-specific API calls
   - Location: apps/api/src/services/installMemory.ts

### 📋 JWT Claims We Extract:

```typescript
type ClockifyJwtClaims = {
  sub: string;           // addon key
  iss: string;           // 'clockify'
  type: string;          // 'addon'
  addonId: string;
  workspaceId: string;
  backendUrl: string;    // ✅ EXTRACTED
  reportsUrl: string;    // ✅ EXTRACTED
  userId?: string;
  user?: string;
  plan: string;
  exp: number;
  iat: number;
};
```

**Grade: A+** - Perfect adherence to environment-agnostic design

---

## 5. Webhook Implementation

### ✅ STRONG Areas:

1. **Event Handling**
   - ✅ Handles TIME_ENTRY_UPDATED and TIME_ENTRY_CREATED
   - ✅ Handles TIME_ENTRY_DELETED (with proper skip logic)
   - Location: apps/api/src/controllers/webhookController.ts

2. **Idempotency**
   - ✅ **Excellent fingerprinting** - hashes custom field changes
   - ✅ Uses KV cache to prevent duplicate processing
   - ✅ 30-minute TTL for fingerprints
   - Location: webhookController.ts:19-32, 191-203

3. **Workspace Validation**
   - ✅ Checks workspace matches configured WORKSPACE_ID
   - ✅ Falls back to installation tokens for multi-workspace support
   - ✅ Rate-limited logging for mismatches
   - Location: webhookController.ts:104-117

4. **API Call Pattern**
   - ✅ Fetches live entry before and after evaluation
   - ✅ Compares hashes to detect concurrent modifications
   - ✅ Skips update if entry changed during evaluation
   - Location: webhookController.ts:125, 172-189

### ⚠️ CRITICAL FIX NEEDED:

**Current Signature Verification:**
```typescript
// webhookController.ts:73-76
const signature = req.header('x-clockify-signature');
if (!verifyClockifySignature(rawBody, signature)) {
  return res.status(401).json({ error: 'Invalid webhook signature' });
}
```

**webhookSecurity.ts Implementation:**
```typescript
export const verifyClockifySignature = (
  payload: string,
  signature: string | undefined
): boolean => {
  if (CONFIG.DEV_ALLOW_UNSIGNED) return true;
  if (!signature || !CONFIG.CLOCKIFY_WEBHOOK_SECRET) return false;

  const hmac = createHmac('sha256', CONFIG.CLOCKIFY_WEBHOOK_SECRET);
  hmac.update(payload);
  const expected = hmac.digest('hex');

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};
```

**Issue:** Using HMAC verification instead of JWT verification

**Guide Says (ADDON GUIDE 2:205-207):**
```
Headers:
- clockify-signature: {JWT}
- clockify-webhook-event-type: TIME_ENTRY_CREATED

Verify with Clockify public key, check iss = "clockify" and sub = addon key
```

**RECOMMENDED FIX:**
```typescript
// In webhookController.ts
const signatureJwt = req.header('clockify-signature');
if (!signatureJwt) {
  return res.status(401).json({ error: 'Missing webhook signature' });
}

try {
  const claims = await verifyClockifyJwt(signatureJwt, CONFIG.ADDON_KEY, false);
  // Verify this is a webhook token
  if (claims.type !== 'addon') {
    return res.status(401).json({ error: 'Invalid webhook token type' });
  }

  // Optional: Compare against stored webhook token from installation
  const storedToken = getWebhookTokenFromMemory(claims.workspaceId, event);
  if (storedToken && signatureJwt !== storedToken) {
    return res.status(401).json({ error: 'Webhook token mismatch' });
  }
} catch (error) {
  return res.status(401).json({ error: 'Invalid webhook signature' });
}
```

---

## 6. Settings Management

### ✅ EXCELLENT Recent Fix:

**Previous Issue:** Settings stored locally in database
**Current Implementation:** Proxies to Clockify Settings API (as per guide)

**From Recent Commit (423d454):**
```typescript
// settingsController.ts:GET
const settingsUrl = `${backendUrl}/addon/workspaces/${workspaceId}/settings`;
const response = await fetch(settingsUrl, {
  method: 'GET',
  headers: {
    'X-Addon-Token': authToken,
    'Accept': 'application/json',
    'User-Agent': 'xCFE/1.0.0'
  }
});
```

**Guide Quote (README.md:88):**
> "Settings are **stored and managed by Clockify**, not in your database. The API proxies requests to Clockify's Settings API using the `auth_token` from the iframe URL."

**Grade: A+** - Perfect implementation after recent fix

### 📋 Settings Lifecycle Integration:

1. **Manifest Definition** (NEEDED)
   ```json
   {
     "settings": {
       "type": "STRUCTURED",
       "path": "/lifecycle/settings-updated",
       "properties": [...]
     }
   }
   ```

2. **Lifecycle Handler** - ✅ IMPLEMENTED
   - Location: lifecycleController.ts:125-213
   - Receives settings updates from Clockify
   - Mirrors relevant settings to local database (for caching)

3. **UI Proxy** - ✅ IMPLEMENTED
   - GET /v1/settings - fetches from Clockify
   - POST /v1/settings - updates in Clockify
   - Uses iframe `auth_token` for authentication

---

## 7. API Call Patterns

### ✅ COMPLIANT:

1. **X-Addon-Token Header**
   ```typescript
   // settingsController.ts:44-46
   headers: {
     'X-Addon-Token': authToken,
     'Accept': 'application/json'
   }
   ```
   **Guide:** "include either the 'X-Api-Key' or the 'X-Addon-Token' in the request header"
   **Our implementation:** ✅ Uses X-Addon-Token correctly

2. **Rate Limiting**
   - ✅ CONFIG has RATE_LIMIT_RPS: 50 (matches guide's 50 rps limit)
   - ✅ ClockifyClient implements exponential backoff
   - ✅ Respects Retry-After headers
   - Location: apps/api/src/lib/clockifyClient.ts

3. **Regional Endpoints**
   - ✅ Uses `backendUrl` from JWT (not hardcoded)
   - ✅ Supports CLOCKIFY_REGION env var for override
   - ✅ Falls back to global endpoint if needed
   - Location: env.ts:72-76

---

## 8. Security Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| JWT signature verification (RS256) | ✅ PASS | jwt.ts:77-92, uses jose library |
| Claims validation (iss, sub, type) | ✅ PASS | jwt.ts:95-114 |
| NBF (not-before) validation | ✅ PASS | jwt.ts:108-110 |
| JWT replay protection (JTI) | ✅ PASS | jwt.ts:124-135, uses KV cache |
| Installation token secure storage | ✅ PASS | Encrypted in DB, memory fallback |
| Never expose tokens in frontend | ✅ PASS | Backend-only token handling |
| HTTPS enforcement | ✅ PASS | BASE_URL validation in env.ts |
| CORS origin validation | ✅ PASS | settingsController.ts:20-24 |
| Webhook JWT verification | ⚠️ FIX | Uses HMAC, should use JWT |
| DEV_ALLOW_UNSIGNED production guard | ✅ PASS | env.ts:145-148 |
| Secrets not in source control | ✅ PASS | Uses .env, example files only |
| Rate limit handling | ✅ PASS | clockifyClient.ts implements backoff |

**Overall Security Grade: A-** (A+ after webhook JWT fix)

---

## 9. Documentation & Developer Experience

### ✅ EXCELLENT:

1. **README.md**
   - ✅ Comprehensive environment variable table
   - ✅ Region matrix with base URLs
   - ✅ Settings proxy documentation
   - ✅ Add-on token authentication flow
   - ✅ Troubleshooting section

2. **Inline Comments**
   - ✅ Good JSDoc comments in key files
   - ✅ Security warnings where appropriate
   - Example: "CRITICAL: Prevent DEV_ALLOW_UNSIGNED in production"

3. **Scripts**
   - ✅ `verify-token.js` for JWT debugging
   - ✅ `dev.sh` for local development
   - ✅ `bootstrap-webhooks.sh` for serverless setup

4. **Type Safety**
   - ✅ Strong TypeScript types throughout
   - ✅ Zod schemas for validation
   - ✅ Type-safe JWT claims

---

## 10. Recommendations Summary

### 🔴 CRITICAL (Do Now):

1. **Fix Webhook Signature Verification**
   - Change from HMAC to JWT verification using `clockify-signature` header
   - Use same `verifyClockifyJwt()` function as lifecycle events
   - File: `apps/api/src/controllers/webhookController.ts:73-76`
   - File: `apps/api/src/lib/webhookSecurity.ts` (replace entire implementation)

2. **Update Manifest to Clockify Standard**
   - Add `key`, `baseUrl` fields
   - Convert to `components[]` and `webhooks[]` arrays with relative paths
   - Add proper `lifecycle` object structure
   - Remove custom `authentication.strategies`
   - File: `infra/manifest.json`

### 🟡 HIGH PRIORITY (This Week):

3. **Store Webhook Tokens from Installation**
   - Extract webhook-specific tokens from installation payload
   - Store per workspace in installation memory
   - Compare against incoming webhook signatures
   - File: `apps/api/src/controllers/lifecycleController.ts:42-79`

4. **Add Structured Settings to Manifest**
   - Define settings schema in manifest
   - Let Clockify render the settings UI
   - Current lifecycle handler already supports it
   - File: `infra/manifest.json` (add `settings` object)

### 🟢 MEDIUM PRIORITY (Nice to Have):

5. **Add UI Components**
   - Implement iframe-based sidebar component
   - Extract `auth_token` from query params
   - Use `X-Addon-Token` header for API calls
   - Request token refresh via `window.postMessage`

6. **Token Refresh Mechanism**
   - User tokens expire after 30 minutes
   - Implement `refreshAddonToken` window message handler
   - File: Create new iframe component

7. **Enhanced Logging**
   - Add correlation IDs to all API calls
   - Log JWT claim details (redacted)
   - Track token refresh events

---

## 11. Code Examples for Fixes

### Example 1: Updated Webhook Verification

```typescript
// apps/api/src/controllers/webhookController.ts

import { verifyClockifyJwt } from '../lib/jwt.js';

export const clockifyWebhookHandler: RequestHandler = async (req, res, next) => {
  try {
    // Verify addon token if present (existing check - keep this)
    const addonToken = req.header('x-addon-token');
    if (CONFIG.ADDON_TOKEN && addonToken !== CONFIG.ADDON_TOKEN) {
      logger.warn({ addonToken: addonToken ? '[REDACTED]' : undefined }, 'Invalid addon token');
      return res.status(403).json({ error: 'Invalid addon token' });
    }

    // UPDATED: Verify JWT signature from clockify-signature header
    const signatureJwt = req.header('clockify-signature');
    if (!signatureJwt && !CONFIG.DEV_ALLOW_UNSIGNED) {
      return res.status(401).json({ error: 'Missing webhook signature' });
    }

    let workspaceIdFromToken: string | undefined;

    if (signatureJwt) {
      try {
        const claims = await verifyClockifyJwt(signatureJwt, CONFIG.ADDON_KEY, false);

        // Validate this is a webhook-type token
        if (claims.type !== 'addon') {
          return res.status(401).json({ error: 'Invalid webhook token type' });
        }

        workspaceIdFromToken = claims.workspaceId;

        // Optional: Compare against stored webhook token
        const storedToken = getWebhookTokenFromMemory(claims.workspaceId, req.header('x-clockify-event'));
        if (storedToken && signatureJwt !== storedToken) {
          logger.warn({ workspaceId: claims.workspaceId }, 'Webhook token mismatch');
        }
      } catch (error) {
        logger.warn({ err: error }, 'Webhook signature verification failed');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const correlationId: string = (req as any).correlationId ?? randomUUID();

    // ... rest of handler
  } catch (error) {
    next(error);
  }
};
```

### Example 2: Store Webhook Tokens at Installation

```typescript
// apps/api/src/controllers/lifecycleController.ts

export const handleInstalled: RequestHandler = async (req, res) => {
  let claims;
  try {
    claims = await getLifecycleClaims(req);
  } catch (error) {
    logger.warn({ err: error }, 'Lifecycle token verification failed');
    return res.status(401).json({ error: error instanceof Error ? error.message : 'Invalid lifecycle token' });
  }

  const { addonId, workspaceId, authToken, webhookTokens } = req.body;

  if (!addonId || !workspaceId) {
    return res.status(400).json({ error: 'Missing required installation data' });
  }

  // NEW: Store webhook-specific tokens
  if (webhookTokens && typeof webhookTokens === 'object') {
    for (const [event, token] of Object.entries(webhookTokens)) {
      storeWebhookToken(workspaceId, event, token as string);
      logger.debug({ workspaceId, event }, 'Stored webhook token for event');
    }
  }

  // ... rest of handler
};
```

### Example 3: Updated Manifest

```json
{
  "schemaVersion": "1.3",
  "key": "xcfe-custom-field-expander",
  "name": "xCustom Field Expander",
  "baseUrl": "https://clockify-xcfe.vercel.app",
  "description": "Automated formula evaluation and validation for Clockify custom fields. Computes amounts, validates data, and maintains consistent custom field values.",
  "subscriptionPlan": "PRO",
  "scopes": [
    "TIME_ENTRY_READ",
    "TIME_ENTRY_WRITE",
    "USER_READ",
    "PROJECT_READ",
    "TASK_READ",
    "CUSTOM_FIELDS_READ",
    "REPORTS_READ"
  ],
  "components": [
    {
      "type": "sidebar.page",
      "label": "Field Expander",
      "path": "/ui/sidebar",
      "accessLevel": "ADMINS"
    }
  ],
  "settings": {
    "type": "STRUCTURED",
    "path": "/lifecycle/settings-updated",
    "properties": [
      {
        "key": "strict_mode",
        "label": "Strict Validation Mode",
        "type": "CHECKBOX",
        "value": false,
        "required": false,
        "accessLevel": "ADMINS",
        "hint": "Enable strict validation for all formula evaluations"
      },
      {
        "key": "reference_months",
        "label": "OT Reference Period (months)",
        "type": "NUMBER",
        "value": 6,
        "required": false,
        "accessLevel": "ADMINS",
        "hint": "Number of historical months to consider for overtime calculations (1-12)"
      },
      {
        "key": "region",
        "label": "Clockify Region",
        "type": "SELECT",
        "required": false,
        "accessLevel": "ADMINS",
        "options": [
          { "value": "global", "label": "Global" },
          { "value": "euc1", "label": "Europe (EU Central)" },
          { "value": "use2", "label": "USA" },
          { "value": "euw2", "label": "UK" },
          { "value": "apse2", "label": "Australia" }
        ],
        "hint": "Override automatic region detection"
      }
    ]
  },
  "lifecycle": {
    "installed": {
      "method": "POST",
      "path": "/lifecycle/installed"
    },
    "statusChanged": {
      "method": "POST",
      "path": "/lifecycle/status-changed"
    },
    "settingsUpdated": {
      "method": "POST",
      "path": "/lifecycle/settings-updated"
    },
    "deleted": {
      "method": "POST",
      "path": "/lifecycle/deleted"
    }
  },
  "webhooks": [
    {
      "event": "TIME_ENTRY_UPDATED",
      "path": "/v1/webhooks/clockify",
      "webhookType": "ADDON"
    },
    {
      "event": "TIME_ENTRY_CREATED",
      "path": "/v1/webhooks/clockify",
      "webhookType": "ADDON"
    }
  ]
}
```

---

## 12. Testing Checklist

Before deploying manifest changes:

- [ ] Manifest validates against schema 1.3
- [ ] `baseUrl` points to production deployment
- [ ] All `path` values are relative to `baseUrl`
- [ ] JWT verification works with real Clockify tokens
- [ ] Webhook signature verification uses JWT (not HMAC)
- [ ] Settings can be saved and retrieved from Clockify
- [ ] Lifecycle events trigger correctly
- [ ] Installation token stored and retrieved
- [ ] Multi-workspace support works (if applicable)
- [ ] DEV_ALLOW_UNSIGNED is false in production
- [ ] CORS allows Clockify domains (*.clockify.me)
- [ ] Rate limiting respects 50 rps limit
- [ ] Token expiry handled gracefully

---

## Conclusion

The xCFE add-on demonstrates **strong adherence** to Clockify best practices with excellent JWT verification, dynamic endpoint resolution, and comprehensive lifecycle handling. The primary areas for improvement are:

1. **Webhook signature verification** - Switch from HMAC to JWT
2. **Manifest structure** - Update to standard Clockify format
3. **Structured settings** - Define schema in manifest

These changes will bring the add-on to **full compliance** with Clockify Marketplace standards.

**Final Grade: A- (A+ after recommended fixes)**

---

## References

- `newyork/ADDON_GUIDE` - Comprehensive end-to-end guide
- `newyork/ADDON GUIDE 2` - Executive summary with best practices
- `newyork/newYork/manifest.json` - Reference implementation
- `newyork/newYork/handlers.py` - Lifecycle event patterns
- `newyork/newYork/auth.py` - JWT verification example
- `newyork/dev-docs.marketplace.cake.com_clockify_build_manifest_lifecycle.html (2).txt` - Quick start guide
- `README.md` - xCFE documentation (recently updated)

---

**Audit Date:** 2025-10-16
**Next Review:** After implementing critical fixes
