#!/bin/bash

# Setup Vercel Environment Variables for Clockify Add-on
echo "Setting up Vercel environment variables..."

# Set basic environment variables
echo "production" | npx vercel env add NODE_ENV
echo "https://api-qz52zby43-alexs-projects-a9be258a.vercel.app" | npx vercel env add BASE_URL
echo "xcfe-custom-field-expander" | npx vercel env add ADDON_KEY
echo "xCustom Field Expander" | npx vercel env add ADDON_NAME
echo "PRO" | npx vercel env add MIN_PLAN
echo "your-32-character-encryption-key-here-12345678901234567890123456789012" | npx vercel env add ENCRYPTION_KEY
echo "https://api.clockify.me/api/v1" | npx vercel env add CLOCKIFY_BASE_URL
echo "your-webhook-secret-here" | npx vercel env add CLOCKIFY_WEBHOOK_SECRET
echo "false" | npx vercel env add DEV_ALLOW_UNSIGNED
echo "info" | npx vercel env add LOG_LEVEL
echo "50" | npx vercel env add RATE_LIMIT_RPS
echo "https://app.clockify.me,https://*.clockify.me,https://developer.clockify.me" | npx vercel env add ADMIN_UI_ORIGIN
echo "/v1" | npx vercel env add VITE_API_BASE_URL
echo "true" | npx vercel env add SKIP_DATABASE_CHECKS
echo "" | npx vercel env add ADMIN_SECRET

# Set RSA public key (multiline)
cat << 'RSA_EOF' | npx vercel env add RSA_PUBLIC_KEY_PEM
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAubktufFNO/op+E5WBWLG
/Y9QRZGSGGCsVOOFmMPR15AOmMSfQu3yq2Yaq47INOzgFy9IUG8/JfwiehsmbrKa
49t/xSkpGlu9wlGUyYg4eKDUwoHKAt3IPwOSt4qsWLKIMO+koUo56CGQOEpTuUi
5bMfmefVBBfShXTaZ0tXPB349FdzSuY1U/503L12zVWMutNhiJCKyGfsuu2uXa9+
6uQnZBwlw03/QEci7i4TbC+ZXqW1lrCcbogSMORQHAP6qSACTFRmrjFAEsOWiUUhZ
rLDg2QJ8VTDghFnUhYkINTI1Ggfo80qEWeINLIwvZjOh3bWRfrqZHsD/Yjhoduk
yQIDAQAB
-----END PUBLIC KEY-----
RSA_EOF

echo "Environment variables set successfully!"
echo "Next: Go to Vercel dashboard to disable authentication protection"
