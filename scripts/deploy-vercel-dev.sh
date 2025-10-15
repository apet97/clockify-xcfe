#!/usr/bin/env bash
set -euo pipefail

# Minimal non-interactive-ish Vercel deploy helper for dev testing
# Prereqs: vercel CLI logged in (vercel login), project linked (vercel link)

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI not found. Install with: npm i -g vercel" >&2
  exit 1
fi

TOKEN="${VERCEL_TOKEN:-}"
SCOPE_ARG="${VERCEL_SCOPE:+--scope $VERCEL_SCOPE}"
PROJECT_NAME="${VERCEL_PROJECT:-clockify-xcfe}"
VC="vercel ${TOKEN:+--token $TOKEN} ${SCOPE_ARG}"

echo "Linking project: $PROJECT_NAME"
$VC link --project "$PROJECT_NAME" --yes || true

echo "Configuring environment variables for dev (unsigned, no DB)..."

echo "production" | $VC env add NODE_ENV production || true
echo "true" | $VC env add SKIP_DATABASE_CHECKS production || true
echo "true" | $VC env add DEV_ALLOW_UNSIGNED production || true
echo "xcfe-custom-field-expander" | $VC env add ADDON_KEY production || true
echo "xCustom Field Expander" | $VC env add ADDON_NAME production || true
echo "FREE" | $VC env add MIN_PLAN production || true
echo "50" | $VC env add RATE_LIMIT_RPS production || true
echo "info" | $VC env add LOG_LEVEL production || true

# Allow iframe calls from Clockify + dev UI
echo "https://developer.clockify.me,http://localhost:5173" | $VC env add ADMIN_UI_ORIGIN production || true

# Encryption key required for JWTs; create a 32+ char value if not set
if [ -z "${ENCRYPTION_KEY:-}" ]; then
  export ENCRYPTION_KEY="dev-$(openssl rand -hex 24)extra-entropy-1234"
fi
echo "$ENCRYPTION_KEY" | $VC env add ENCRYPTION_KEY production || true

echo "Deploying to production..."
URL=$($VC deploy --prod --confirm)

echo ""
echo "Deployed: $URL"
echo "Manifest: $URL/manifest.json"
echo "Webhooks: $URL/v1/webhooks/clockify"
echo "Sidebar:  $URL/ui/sidebar"
echo ""
echo "Next steps:" 
echo "1) Use the 'Manifest' URL in Clockify Developer Portal."
echo "2) Install to workspace; the installation token will be cached in-memory."
echo "3) Open sidebar in Clockify to validate iframe loading."
echo "4) Create/update a time entry; webhooks will process and patch fields."
