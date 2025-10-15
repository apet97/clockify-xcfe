#!/usr/bin/env bash
set -euo pipefail

# Usage: bash scripts/bootstrap-webhooks.sh [base_url]
# base_url (optional): e.g., https://your-app.vercel.app

BASE_URL_ARG=${1:-}

if [[ -n "${BASE_URL_ARG}" ]]; then
  API_URL="${BASE_URL_ARG}"
elif [[ -n "${BASE_URL:-}" ]]; then
  API_URL="${BASE_URL}"
elif [[ -n "${VERCEL_URL:-}" ]]; then
  # Vercel provides host only; prepend https
  if [[ "${VERCEL_URL}" =~ ^https?:// ]]; then
    API_URL="${VERCEL_URL}"
  else
    API_URL="https://${VERCEL_URL}"
  fi
else
  echo "error: provide base_url argument or set BASE_URL/VERCEL_URL" >&2
  exit 1
fi

API_URL="${API_URL%/}"

if [[ -z "${ENCRYPTION_KEY:-}" ]]; then
  echo "error: ENCRYPTION_KEY must be set (used as admin secret)" >&2
  exit 1
fi

echo "Bootstrapping webhooks at: ${API_URL}/api/webhooks/bootstrap" >&2
set -x
curl -fsSL -X POST \
  "${API_URL}/api/webhooks/bootstrap" \
  -H "X-Admin-Secret: ${ENCRYPTION_KEY}" \
  -H "Content-Type: application/json"
set +x
echo

