# Environment Variables Status

## Currently Set (Development)
- ADMIN_UI_ORIGIN
- BASE_URL
- CLOCKIFY_BASE_URL
- CLOCKIFY_PUBLIC_KEY_PEM
- LOG_LEVEL
- VERCEL_OIDC_TOKEN

## MISSING (Required for Production)
- ADDON_KEY ❌
- ADMIN_SECRET ❌
- CLOCKIFY_WEBHOOK_SECRET ❌
- WORKSPACE_ID ❌
- DATABASE_URL (optional)
- ENCRYPTION_KEY ❌

## Next Action
Set missing vars for production environment:
```bash
vercel env add ADDON_KEY production
vercel env add ADMIN_SECRET production
vercel env add CLOCKIFY_WEBHOOK_SECRET production
vercel env add WORKSPACE_ID production
vercel env add ENCRYPTION_KEY production
```
