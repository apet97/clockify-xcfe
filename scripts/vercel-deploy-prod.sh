#!/usr/bin/env bash
set -eo pipefail

# Non-interactive Vercel production deploy for xCFE
# Requires: VERCEL_TOKEN, ENCRYPTION_KEY, RSA_PUBLIC_KEY_PEM
# Optional: ADMIN_UI_ORIGIN (default allows Clockify app), VITE_API_BASE_URL, SKIP_DATABASE_CHECKS

if ! command -v vercel >/dev/null 2>&1; then
  echo "error: vercel CLI not found. Install via: npm i -g vercel" >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "error: pnpm not found. Enable via: corepack enable pnpm" >&2
  exit 1
fi

# Optional: VERCEL_TOKEN. If not provided, uses existing logged-in session.
VC_TOKEN_OPT=""
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  VC_TOKEN_OPT="--token ${VERCEL_TOKEN}"
fi

if [[ -z "${ENCRYPTION_KEY:-}" ]]; then
  echo "error: ENCRYPTION_KEY is required (>=32 chars)" >&2
  exit 1
fi

if [[ -z "${RSA_PUBLIC_KEY_PEM:-}" ]]; then
  echo "error: RSA_PUBLIC_KEY_PEM is required (Clockify RSA public key)" >&2
  exit 1
fi

ADMIN_UI_ORIGIN_DEFAULT="https://app.clockify.me,https://*.clockify.me"
ADMIN_UI_ORIGIN_VALUE="${ADMIN_UI_ORIGIN:-$ADMIN_UI_ORIGIN_DEFAULT}"
VITE_API_BASE_URL_VALUE="${VITE_API_BASE_URL:-/v1}"
SKIP_DATABASE_CHECKS_VALUE="${SKIP_DATABASE_CHECKS:-true}"

echo "==> Pulling Vercel project settings (production)"
vercel pull --yes --environment=production ${VC_TOKEN_OPT} >/dev/null

echo "==> Setting environment variables (production)"
printf "%s" "$ENCRYPTION_KEY" | vercel env add ENCRYPTION_KEY production ${VC_TOKEN_OPT} >/dev/null || true
printf "%s" "$ADMIN_UI_ORIGIN_VALUE" | vercel env add ADMIN_UI_ORIGIN production ${VC_TOKEN_OPT} >/dev/null || true
printf "%s" "$VITE_API_BASE_URL_VALUE" | vercel env add VITE_API_BASE_URL production ${VC_TOKEN_OPT} >/dev/null || true
printf "%s" "$SKIP_DATABASE_CHECKS_VALUE" | vercel env add SKIP_DATABASE_CHECKS production ${VC_TOKEN_OPT} >/dev/null || true

# Multiline RSA key via heredoc
vercel env add RSA_PUBLIC_KEY_PEM production ${VC_TOKEN_OPT} >/dev/null <<EOF
${RSA_PUBLIC_KEY_PEM}
EOF

echo "==> Installing dependencies"
pnpm install >/dev/null

echo "==> Building (vercel build --prod)"
vercel build --prod ${VC_TOKEN_OPT} >/dev/null

echo "==> Deploying prebuilt output (production)"
DEPLOY_OUTPUT=$(vercel deploy --prebuilt --prod ${VC_TOKEN_OPT} 2>&1)
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | rg -o "https://[a-zA-Z0-9.-]+" | tail -n1)

if [[ -z "$DEPLOY_URL" ]]; then
  echo "$DEPLOY_OUTPUT"
  echo "error: failed to capture deployment URL" >&2
  exit 1
fi

echo "==> Deployed: $DEPLOY_URL"
echo "Manifest URL: ${DEPLOY_URL%/}/manifest.json"
