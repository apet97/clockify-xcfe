# Production Environment Variables Setup

## Root Cause of 500 Errors
Config validation fails at startup due to missing required env vars.
**ENCRYPTION_KEY** is required (env.ts:76).

## Required Variables for Production

### 1. ENCRYPTION_KEY (REQUIRED)
Generate a secure 32+ character key:
```bash
openssl rand -base64 48
```
Then set:
```bash
echo "Paste generated key:" && read KEY && vercel env add ENCRYPTION_KEY production <<< "$KEY"
```

### 2. CLOCKIFY_PUBLIC_KEY_PEM (REQUIRED unless DEV_ALLOW_UNSIGNED=true)
Get from Clockify Developer Portal or Marketplace settings.
Multi-line PEM format. Set via:
```bash
# Prepare PEM in file
cat > /tmp/clockify_pub.pem <<'PEM'
-----BEGIN PUBLIC KEY-----
<paste RSA public key here>
-----END PUBLIC KEY-----
PEM

# Set in Vercel (reads from stdin)
vercel env add CLOCKIFY_PUBLIC_KEY_PEM production < /tmp/clockify_pub.pem
rm /tmp/clockify_pub.pem
```

### 3. ADDON_KEY (defaults to 'xcfe-custom-field-expander')
Unique add-on identifier. Match manifest.
```bash
vercel env add ADDON_KEY production
# Enter: xcfe-custom-field-expander
```

### 4. WORKSPACE_ID (defaults to 'dev-workspace')
Your Clockify workspace ID:
```bash
vercel env add WORKSPACE_ID production
# Enter your workspace ID (e.g., 64abc...)
```

### 5. CLOCKIFY_WEBHOOK_SECRET (OPTIONAL but RECOMMENDED)
Used for HMAC webhook signature verification:
```bash
openssl rand -hex 32
# Copy output, then:
vercel env add CLOCKIFY_WEBHOOK_SECRET production
# Paste hex string
```

### 6. ADMIN_SECRET (OPTIONAL)
For protected internal endpoints:
```bash
openssl rand -base64 32
vercel env add ADMIN_SECRET production
# Paste generated secret
```

### 7. SKIP_DATABASE_CHECKS (SET TO true)
Skip DB requirement for serverless:
```bash
vercel env add SKIP_DATABASE_CHECKS production
# Enter: true
```

## Environment Variables That Auto-Set
- **BASE_URL**: Auto-derived from VERCEL_URL (already set)
- **CLOCKIFY_BASE_URL**: Defaults to https://api.clockify.me/api/v1
- **NODE_ENV**: Auto-set to 'production' by Vercel

## Quick Setup Script
```bash
#!/bin/bash
# Run this to set all required env vars

# 1. ENCRYPTION_KEY
ENC_KEY=$(openssl rand -base64 48)
echo "$ENC_KEY" | vercel env add ENCRYPTION_KEY production

# 2. CLOCKIFY_WEBHOOK_SECRET
WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "$WEBHOOK_SECRET" | vercel env add CLOCKIFY_WEBHOOK_SECRET production

# 3. SKIP_DATABASE_CHECKS
echo "true" | vercel env add SKIP_DATABASE_CHECKS production

# 4. ADDON_KEY
echo "xcfe-custom-field-expander" | vercel env add ADDON_KEY production

# 5. WORKSPACE_ID (replace with your actual workspace ID)
echo "YOUR_WORKSPACE_ID_HERE" | vercel env add WORKSPACE_ID production

# 6. ADMIN_SECRET
ADMIN_SECRET=$(openssl rand -base64 32)
echo "$ADMIN_SECRET" | vercel env add ADMIN_SECRET production

# 7. CLOCKIFY_PUBLIC_KEY_PEM (manual - requires actual PEM)
echo "⚠️ Set CLOCKIFY_PUBLIC_KEY_PEM manually via:"
echo "vercel env add CLOCKIFY_PUBLIC_KEY_PEM production"
echo "Paste full PEM including BEGIN/END lines"
```

## Verification After Setting
```bash
# Pull production env
vercel env pull .env.production --environment=production

# Check non-secret keys set
grep -E '^(ADDON_KEY|WORKSPACE_ID|BASE_URL|SKIP_DATABASE_CHECKS)=' .env.production

# Verify secrets exist (values will be @...)
grep -E '^(ENCRYPTION_KEY|CLOCKIFY_PUBLIC_KEY_PEM|CLOCKIFY_WEBHOOK_SECRET)=' .env.production
```

## Deploy After Env Setup
```bash
vercel --prod
```
