# xCFE Installation Runbook

## Overview
Clockify add-on installation follows a specific sequence: marketplace listing → lifecycle webhooks → iframe loading.

## Installation Flow

### Step 1: Marketplace Discovery
- User browses Clockify Marketplace
- Finds "xCustom Field Expander" add-on
- Clicks "Install" button

### Step 2: Clockify Calls Lifecycle Webhooks
Clockify's platform calls the add-on's lifecycle endpoints defined in manifest:

```http
POST https://9e5a48f11537.ngrok-free.app/lifecycle/installed
Headers:
  X-Addon-Lifecycle-Token: <signed JWT from Clockify>
  Content-Type: application/json
Body:
  {
    "addonId": "xcfe.example",
    "workspaceId": "<workspace-id>",
    "authToken": "<installation-token>"
  }
```

**Add-on must:**
- Verify `X-Addon-Lifecycle-Token` signature
- Store `authToken` for future API calls (workspace-scoped credential)
- Return `{"success": true}` with 200 status

**In DEV mode (DEV_ALLOW_UNSIGNED=true):**
- Token verification is bypassed if header missing
- Allows manual testing without real Clockify tokens

### Step 3: Portal Loads Iframe
After successful installation, when user opens the add-on in Clockify:

```
https://app.clockify.me/...
  └─> iframe loads:
      https://9e5a48f11537.ngrok-free.app/ui/sidebar?auth_token=<iframe-jwt>&...
```

**Iframe JWT contains claims:**
- `workspaceId`: current workspace ID
- `userId`: current user ID
- `backendUrl`: Clockify API base (e.g., `https://api.clockify.me/api`)
- `sub`: addon key (xcfe.example)
- `type`: "addon"
- `iat`, `exp`: issued/expiry timestamps

**Important:** This is the FIRST time an iframe JWT exists. Do not ask user for JWT before installation.

## Credentials Hierarchy

After iframe loads with valid JWT, credential cascade for API calls:

1. **Iframe token** (from `?auth_token=` query) - user-scoped, short-lived
2. **Installation token** (stored from `/lifecycle/installed`) - workspace-scoped
3. **ADDON_TOKEN** (from env) - fallback for testing
4. **API_KEY** (from env) - legacy fallback

## Testing Without Real Install

Use DEV mode:
```bash
curl -X POST "http://localhost:8080/lifecycle/installed" \
  -H 'content-type: application/json' \
  -d '{"addonId":"xcfe.example","workspaceId":"ws-test","authToken":"test-token"}'
```

Check tracking:
```bash
curl "http://localhost:8080/v1/debug/last-lifecycle"
```

## Verification Checklist

- [ ] `/manifest` returns `baseUrl` matching PUBLIC_HOST
- [ ] `/lifecycle/installed` accepts valid shape, returns 200
- [ ] `/lifecycle/settings` validates with Zod, returns 400/200 appropriately
- [ ] `/v1/debug/last-lifecycle` shows recorded events
- [ ] After real install, iframe URL contains `?auth_token=...`
- [ ] Recompute endpoint requires iframe JWT (401 without)

## Next Steps After Install

1. Capture iframe request from browser DevTools (Network tab)
2. Extract `auth_token` query parameter (this is the iframe JWT)
3. Use JWT to test `/v1/formulas/recompute` endpoint
4. Verify CF updates via read-back
