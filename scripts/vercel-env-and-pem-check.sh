#!/usr/bin/env bash
set -euo pipefail

# Vercel Env + PEM Setup & Self‑Check
#
# Usage examples:
#   bash scripts/vercel-env-and-pem-check.sh \
#     --project "$VERCEL_PROJECT" \
#     --repo-root "$(pwd)" \
#     --pem-file ./public.pem \
#     --prod-alias https://your-addon.example.com
#
#   bash scripts/vercel-env-and-pem-check.sh --project clockify-xcfe --pem-env "${CLOCKIFY_PUBLIC_KEY_PEM}"
#
# Notes:
# - Requires: vercel CLI (logged in), openssl, jq
# - Never echoes secret material; PEM is piped from file/env
# - The app accepts CLOCKIFY_PUBLIC_KEY_PEM as an alias for RSA_PUBLIC_KEY_PEM

PROJECT_NAME=""
REPO_ROOT="${PWD}"
PEM_FILE=""
PEM_ENV=""
PROD_ALIAS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) PROJECT_NAME="$2"; shift 2 ;;
    --repo-root) REPO_ROOT="$2"; shift 2 ;;
    --pem-file) PEM_FILE="$2"; shift 2 ;;
    --pem-env) PEM_ENV="$2"; shift 2 ;;
    --prod-alias) PROD_ALIAS="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

if ! command -v vercel >/dev/null 2>&1; then
  echo "error: vercel CLI not found. Install with: npm i -g vercel" >&2
  exit 1
fi
if ! command -v openssl >/dev/null 2>&1; then
  echo "error: openssl not found" >&2
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq not found" >&2
  exit 1
fi

echo "==> Pre-flight"
vercel --version >/dev/null
vercel whoami >/dev/null || vercel login

cd "$REPO_ROOT"
if [[ -n "$PROJECT_NAME" ]]; then
  vercel link --project "$PROJECT_NAME" --yes >/dev/null
fi

echo "==> Pulling current envs"
vercel env ls || true
vercel pull .env.local --environment=production >/dev/null || true
test -f .env.local && echo "pulled=.env.local"

mkdir -p .artifacts
PEM_PATH=".artifacts/clockify_public.pem"

if [[ -n "$PEM_FILE" ]]; then
  cp "$PEM_FILE" "$PEM_PATH"
elif [[ -n "$PEM_ENV" ]]; then
  printf "%s\n" "$PEM_ENV" > "$PEM_PATH"
else
  echo "warn: no --pem-file/--pem-env provided; will not update PEM env" >&2
fi

if [[ -s "$PEM_PATH" ]]; then
  echo "==> PEM sanity (headers + parse)"
  head -n1 "$PEM_PATH" | grep -q "BEGIN PUBLIC KEY" || { echo "error: missing PEM header" >&2; exit 1; }
  tail -n1 "$PEM_PATH" | grep -q "END PUBLIC KEY" || { echo "error: missing PEM footer" >&2; exit 1; }
  openssl pkey -pubin -in "$PEM_PATH" -text -noout | head -n 2

  echo "==> Setting CLOCKIFY_PUBLIC_KEY_PEM across environments"
  for env in production preview development; do
    vercel env rm CLOCKIFY_PUBLIC_KEY_PEM "$env" -y >/dev/null 2>&1 || true
    vercel env add CLOCKIFY_PUBLIC_KEY_PEM "$env" < "$PEM_PATH" >/dev/null
  done
fi

setenv() {
  local key="$1"; shift
  local val="$1"; shift
  for env in production preview development; do
    vercel env rm "$key" "$env" -y >/dev/null 2>&1 || true
    printf "%s" "$val" | vercel env add "$key" "$env" >/dev/null
  done
}

echo "==> Ensuring required envs"
setenv ADMIN_UI_ORIGIN "https://app.clockify.me,https://*.clockify.me,https://developer.clockify.me"
setenv CLOCKIFY_BASE_URL "https://api.clockify.me/api/v1"
setenv LOG_LEVEL "info"

echo "==> First deploy (if needed)"
DEPLOY_OUTPUT=$(vercel deploy --prod --confirm 2>&1 || true)
echo "$DEPLOY_OUTPUT" | sed -n '1,3p'

echo "==> Resolving canonical production URL"
CANONICAL_URL=""
if [[ -n "$PROD_ALIAS" ]]; then
  CURRENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || true)
  if [[ -n "$CURRENT_URL" && -n "$PROD_ALIAS" ]]; then
    vercel alias set "$CURRENT_URL" "$PROD_ALIAS" >/dev/null || true
    CANONICAL_URL="$PROD_ALIAS"
  fi
fi
if [[ -z "$CANONICAL_URL" ]]; then
  RAW_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || true)
  if [[ -n "$RAW_URL" ]]; then CANONICAL_URL="https://$RAW_URL"; fi
fi

if [[ -n "$CANONICAL_URL" ]]; then
  echo "$CANONICAL_URL" > .artifacts/base_url.txt
  setenv BASE_URL "$CANONICAL_URL"
  echo "==> Redeploying to pick up BASE_URL"
  vercel deploy --prod --confirm >/dev/null || true
  code=$(curl -sS -o /dev/null -w "%{http_code}\n" "$CANONICAL_URL/health" || true)
  echo "health=$code url=$CANONICAL_URL"
fi

echo "==> Final env list"
vercel env ls || true

echo "OK: Env checked. ${CANONICAL_URL:+BASE_URL=$CANONICAL_URL}"

