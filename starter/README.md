# Clockify Add-on Starter

Minimal, shippable Clockify add-on with manifest v1.3, lifecycle hooks, settings proxy, webhooks, and sidebar component.

## Features

- ✅ **Manifest v1.3** with FREE plan, sidebar component, structured settings
- ✅ **JWT Verification** (RS256) for all endpoints
- ✅ **Lifecycle Hooks**: INSTALLED, STATUS_CHANGED, SETTINGS_UPDATED, DELETED
- ✅ **Settings Proxy**: GET/PATCH to Clockify settings API
- ✅ **Webhooks**: TIME_ENTRY_UPDATED, NEW_TIME_ENTRY
- ✅ **Sidebar Component**: Shows total time for last 7 days, token refresh, toasts

## Prerequisites

- Node.js 20+
- pnpm (or npm)
- Clockify workspace with PRO/ENTERPRISE plan (for add-on development)
- Public HTTPS URL (ngrok, Cloudflare Tunnel, etc.)

## Setup

### 1. Install Dependencies

```bash
cd starter
pnpm install
```

### 2. Configure Environment

Create `.env` file:

```bash
# Add-on key (must match manifest)
export ADDON_KEY="time-reports-example"

# Public base URL (must be HTTPS in production)
export BASE_URL="https://your-ngrok-or-host.com"

# Server port
export PORT=8080

# Clockify Public RSA Key for JWT verification
# Get from: https://clockify.me/developers#section/Authentication/JWT-verification
export PUBLIC_RSA_PEM="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----"
```

**Important**: Replace `PUBLIC_RSA_PEM` with the actual Clockify public key from their developer docs.

### 3. Run Development Server

```bash
pnpm dev
```

Server starts on `http://localhost:8080` (or your configured PORT).

### 4. Expose Public URL

Use ngrok or similar:

```bash
ngrok http 8080
```

Update `BASE_URL` in `.env` to match your ngrok URL (e.g., `https://abc123.ngrok-free.app`).

## Installation

### 1. Upload Manifest

- Go to [Clockify Developer Console](https://marketplace.clockify.me/apps/console)
- Create new add-on or update existing
- Set manifest URL: `https://your-base-url.com/manifest.json`
- Save and deploy

### 2. Install to Workspace

- Go to Clockify workspace settings
- Navigate: **Integrations** → **Add-ons**
- Find "Time Reports" and click **Install**
- Clockify will send `POST /lifecycle/installed` webhook

### 3. Open Sidebar

- In Clockify time tracker, look for "Time Reports" in sidebar
- Click to open the sidebar iframe
- Add-on loads with `?auth_token=...` in URL

### 4. Verify Installation

Check server logs for:
```json
{"event":"INSTALLED","workspaceId":"...","userId":"...","addonId":"..."}
```

## E2E Testing

### Test 1: Sidebar Renders Total Time

1. Open "Time Reports" sidebar in Clockify
2. Sidebar should display total hours/minutes for last 7 days
3. If no time entries exist, should show "0h 0m"
4. If error occurs, should display error message in red

### Test 2: Token Refresh

1. Click "🔑 Refresh Token" button
2. Clockify should send `addonTokenRefreshed` message
3. Sidebar reloads data with new token
4. Toast notification: "Token refreshed successfully"

### Test 3: Settings API

**GET settings:**
```bash
curl "https://your-base-url.com/addon/settings?auth_token=YOUR_JWT"
```

**PATCH settings:**
```bash
curl -X PATCH "https://your-base-url.com/addon/settings?auth_token=YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '[{"id":"reportDays","value":"14"},{"id":"showDescription","value":"false"}]'
```

Verify response contains updated settings.

### Test 4: Webhooks

1. Create or update a time entry in Clockify
2. Check server logs for:
```json
{"event":"NEW_TIME_ENTRY","workspaceId":"...","userId":"...","timeEntryId":"..."}
```

3. Verify webhook signature was validated (no 401 errors)

### Test 5: Lifecycle Events

**Status change:**
1. Disable add-on in Clockify settings
2. Verify log: `{"event":"STATUS_CHANGED","workspaceId":"...","status":"DISABLED"}`
3. Re-enable add-on
4. Verify log: `{"event":"STATUS_CHANGED","workspaceId":"...","status":"ENABLED"}`

**Settings updated:**
1. Change settings in Clockify add-on settings page
2. Click "Save"
3. Verify log: `{"event":"SETTINGS_UPDATED","workspaceId":"...","settings":[...]}`

**Uninstall:**
1. Uninstall add-on from workspace
2. Verify log: `{"event":"DELETED","workspaceId":"...","addonId":"..."}`

## Architecture

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/manifest.json` | Serves add-on manifest |
| GET | `/ui/sidebar` | Serves sidebar HTML |
| POST | `/lifecycle/installed` | Installation webhook |
| POST | `/lifecycle/status-changed` | Enable/disable webhook |
| POST | `/lifecycle/settings-updated` | Settings save webhook |
| POST | `/lifecycle/deleted` | Uninstall webhook |
| GET | `/addon/settings` | Proxy to Clockify settings |
| PATCH | `/addon/settings` | Proxy to Clockify settings |
| POST | `/webhooks/time-entry` | Time entry webhooks |
| GET | `/health` | Health check |

### Security

- **JWT Verification**: All requests verify JWT signature with Clockify public RSA key
- **Claim Checks**: Validates `iss=clockify`, `type=addon/lifecycle`, `sub=<addon-key>`
- **Webhook Signatures**: Verifies `clockify-signature` header with same JWT verification
- **Token Storage**: Installation tokens stored in-memory (use database in production)

### Data Flow

1. **Installation**: Clockify → POST `/lifecycle/installed` with `X-Addon-Lifecycle-Token`
2. **Sidebar Load**: Clockify iframe → GET `/ui/sidebar?auth_token=...`
3. **API Calls**: Sidebar → Clockify API using `claims.backendUrl` (never hardcoded)
4. **Settings**: Sidebar → `/addon/settings` → Clockify settings API (proxied)
5. **Webhooks**: Clockify → POST `/webhooks/time-entry` with `clockify-signature`

## Production Deployment

### Requirements

1. **HTTPS**: BASE_URL must be HTTPS in production
2. **Database**: Replace in-memory `installations` Map with database (PostgreSQL, MongoDB, etc.)
3. **Logging**: Replace console.log with structured logger (Pino, Winston, etc.)
4. **Error Handling**: Add proper error monitoring (Sentry, etc.)
5. **Rate Limiting**: Implement rate limiting on all endpoints
6. **CORS**: Configure CORS headers if serving from different domain

### Environment Variables

```bash
NODE_ENV=production
ADDON_KEY=your-addon-key
BASE_URL=https://your-production-domain.com
PORT=8080
PUBLIC_RSA_PEM="-----BEGIN PUBLIC KEY-----..."
DATABASE_URL=postgresql://...
```

### Build and Run

```bash
pnpm build
pnpm start
```

## Troubleshooting

### "Missing auth_token in URL"

- Ensure add-on is opened from within Clockify (not directly in browser)
- Check manifest `baseUrl` matches your server URL
- Verify add-on is installed to workspace

### "JWT verification failed"

- Confirm `PUBLIC_RSA_PEM` contains correct Clockify public key
- Check token expiration (default: 30 minutes)
- Use "Refresh Token" button to get new token

### "Installation not found"

- Ensure add-on was installed via `/lifecycle/installed` webhook
- Check server logs for INSTALLED event
- Restart server and reinstall add-on

### "Failed to load time data"

- Verify `backendUrl` claim is correct in JWT
- Check network requests in browser DevTools
- Ensure scopes include `TIME_ENTRY_READ`
- Confirm user has time entries in last 7 days

### Webhooks not firing

- Verify webhook URLs are publicly accessible (not localhost)
- Check Clockify Developer Console for webhook delivery logs
- Ensure `clockify-signature` header is present
- Confirm event type matches registered webhook

## Resources

- [Clockify Add-ons Documentation](https://clockify.me/developers#section/Add-ons)
- [Manifest v1.3 Schema](https://clockify.me/developers#section/Add-ons/Manifest)
- [JWT Verification](https://clockify.me/developers#section/Authentication/JWT-verification)
- [Lifecycle Webhooks](https://clockify.me/developers#section/Add-ons/Lifecycle-webhooks)
- [Settings API](https://clockify.me/developers#section/Add-ons/Settings)

## License

MIT
