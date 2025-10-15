#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this script to set up all required environment variables for production

echo "Setting up Vercel environment variables..."

# Read the production .env file and set variables
# Note: You'll need to set these manually in Vercel dashboard or via CLI

echo "Required environment variables from .env:"
echo "----------------------------------------"

cat << 'EOF'
NODE_ENV=production
BASE_URL=https://clockify-xcfe-1405emvqo-alexs-projects-a9be258a.vercel.app
ADDON_KEY=xcfe-custom-field-expander
ADDON_NAME=xCustom Field Expander
MIN_PLAN=PRO
CLOCKIFY_BASE_URL=https://api.clockify.me/api/v1
CLOCKIFY_WEBHOOK_SECRET=your-webhook-secret-here
DEV_ALLOW_UNSIGNED=false
LOG_LEVEL=info
RATE_LIMIT_RPS=50
ADMIN_UI_ORIGIN=https://app.clockify.me,https://*.clockify.me,https://developer.clockify.me
VITE_API_BASE_URL=/v1
SKIP_DATABASE_CHECKS=true
ADMIN_SECRET=
ENCRYPTION_KEY=your-32-character-encryption-key-here-12345678901234567890123456789012
RSA_PUBLIC_KEY_PEM=-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAubktufFNO/op+E5WBWLG
/Y9QRZGSGGCsVOOFmMPR15AOmMSfQu3yq2Yaq47INOzgFy9IUG8/JfwiehsmbrKa
49t/xSkpGlu9wlGUyYg4eKDUwoHKAt3IPwOSt4qsWLKIMO+koUo56CGQOEpTuUi
5bMfmefVBBfShXTaZ0tXPB349FdzSuY1U/503L12zVWMutNhiJCKyGfsuu2uXa9+
6uQnZBwlw03/QEci7i4TbC+ZXqW1lrCcbogSMORQHAP6qSACTFRmrjFAEsOWiUUhZ
rLDg2QJ8VTDghFnUhYkINTI1Ggfo80qEWeINLIwvZjOh3bWRfrqZHsD/Yjhoduk
yQIDAQAB
-----END PUBLIC KEY-----
EOF

echo ""
echo "DATABASE_URL will be set automatically when Vercel Postgres is created."
echo ""
echo "Next steps:"
echo "1. Create Vercel Postgres database in dashboard"
echo "2. Set these environment variables in Vercel dashboard"
echo "3. Redeploy the application"
echo "4. Test the manifest endpoint"
