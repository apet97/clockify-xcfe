# Admin UI Token Handling

## Token Source (apps/admin-ui/src/utils/api.ts:21)
```typescript
const iframeToken = new URLSearchParams(window.location.search).get('auth_token');
if (iframeToken && !url.searchParams.has('auth_token')) {
  url.searchParams.set('auth_token', iframeToken);
}
```

## Security Assessment
✅ No localStorage or sessionStorage of raw JWT observed
✅ Token read from URL query parameter (Clockify iframe standard)
✅ Token appended to API requests via query parameter
⚠️ Token transmitted in URL (visible in logs, browser history)

## Alternatives
- Use X-Addon-Token header instead of query parameter
- Decode and extract only necessary claims from JWT
- Store in memory only (React state/context)

# Vercel Configuration

## Build (vercel.json:8)
- Single build: apps/api/src/server.ts with @vercel/node
- buildCommand: pnpm install && pnpm run build
- includeFiles: apps/**/public/**, apps/**/dist/**

## Routes
- /manifest.json → server.ts
- /api/(.*)  → server.ts
- /ui/(.*)   → server.ts
- /(.*)      → server.ts (catch-all)

All routes resolve to single serverless function (apps/api/src/server.ts).

## Environment
- PNPM_NODE_LINKER=hoisted
- See .artifacts/env.matrix.md for complete env var inventory

## Deployment Architecture
- Serverless function (not edge)
- Single-region deployment (configurable via Vercel dashboard)
- No static file serving (all via Express server.ts)
