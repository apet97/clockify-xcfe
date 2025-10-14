#!/usr/bin/env bash
#
# STEP 8 E2E TEST - INLINE IMPLEMENTATION
# Complete Step 8: tunnel → manifest → install → JWT → recompute → artifacts
#

set -euo pipefail
cd "$(dirname "$0")"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║               STEP 8 E2E TEST - EXECUTION                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Ensure deps and server
echo "[1/7] Checking dependencies and server..."
if ! command -v pnpm >/dev/null; then
  echo "✗ pnpm missing! Install: npm install -g pnpm"
  exit 1
fi
echo "✓ pnpm available"

if ! lsof -ti :8080 >/dev/null 2>&1; then
  echo "  Starting dev server..."
  pnpm dev >/dev/null 2>&1 &
  sleep 3
fi

if lsof -ti :8080 >/dev/null 2>&1; then
  echo "✓ Server running on port 8080"
else
  echo "✗ Failed to start server on port 8080"
  exit 1
fi

# Step 2: Start public tunnel (user action)
echo ""
echo "[2/7] Start public tunnel in SEPARATE terminal:"
echo ""
if command -v ngrok >/dev/null 2>&1; then
  echo "  Option A: ngrok http 8080"
fi
if command -v cloudflared >/dev/null 2>&1; then
  echo "  Option B: cloudflared tunnel --url http://localhost:8080"
fi
echo ""
read -p "Paste tunnel HTTPS URL (e.g., https://abc123.ngrok-free.app): " PUB

if [[ -z "$PUB" ]]; then
  echo "✗ No URL provided"
  exit 1
fi

if [[ ! "$PUB" =~ ^https:// ]]; then
  echo "✗ URL must start with https://"
  exit 1
fi

PUB="${PUB%/}"  # Remove trailing slash
echo "✓ Public URL: $PUB"

# Step 3: Update .env BASE_URL and restart dev
echo ""
echo "[3/7] Updating .env and restarting server..."

if [ -f .env ]; then
  cp .env .env.bak.$(date +%s)
  echo "✓ Backed up .env"
else
  echo "  Creating new .env"
fi

PORT="${PORT:-8080}"

# Update or create .env
if [ -f .env ]; then
  awk -v v="$PUB" 'BEGIN{e=1} /^BASE_URL=/{print "BASE_URL="v; e=0; next} {print} END{if(e) print "BASE_URL="v}' .env > .env.tmp
  mv .env.tmp .env
else
  printf "BASE_URL=%s\nPORT=%s\n" "$PUB" "$PORT" > .env
fi

echo "✓ Updated BASE_URL=$PUB"

# Restart dev server
echo "  Restarting dev server..."
pkill -f "tsx watch" 2>/dev/null || true
sleep 1
pnpm dev >/dev/null 2>&1 &
sleep 3

# Verify public URL
HTTP_STATUS=$(curl -sI "$PUB/manifest.json" 2>&1 | head -n1 || echo "Failed")
echo "✓ Public URL check: $HTTP_STATUS"

# Step 4: Guide publish + install
echo ""
echo "[4/7] MANUAL STEPS REQUIRED:"
echo ""
echo "  Step 4a: Upload Manifest"
echo "    → Open: https://marketplace.clockify.me/apps/console"
echo "    → Set manifest URL: $PUB/manifest.json"
echo "    → Click 'Save' and 'Deploy'"
echo ""
read -p "Press ENTER when manifest is uploaded and deployed..."

echo ""
echo "  Step 4b: Install Add-on"
echo "    → Clockify → Settings → Integrations → Add-ons"
echo "    → Find 'xCustom Field Expander'"
echo "    → Click 'Install'"
echo ""
read -p "Press ENTER when add-on is installed..."

# Step 5: Securely capture iframe JWT
echo ""
echo "[5/7] Capture iframe JWT"
echo ""
echo "  → Open Clockify time tracker"
echo "  → Click 'xCFE' sidebar"
echo "  → F12 → Network tab → filter 'sidebar'"
echo "  → Find: /ui/sidebar?auth_token=eyJ..."
echo "  → Copy entire auth_token value"
echo ""
printf "Paste iframe auth_token JWT (hidden): " 1>&2
stty -echo
read -r REAL_JWT
stty echo
printf "\n" 1>&2

if [[ -z "$REAL_JWT" ]]; then
  echo "✗ No JWT provided"
  exit 1
fi

if [[ ! "$REAL_JWT" =~ ^eyJ ]]; then
  echo "✗ Invalid JWT format (should start with 'eyJ')"
  exit 1
fi

echo "✓ JWT captured (${#REAL_JWT} chars)"

# Step 6: Verbose logs and recompute
echo ""
echo "[6/7] Running recompute with verbose logging..."

mkdir -p .artifacts

# Stop existing API processes
pkill -f "@xcfe/api" 2>/dev/null || true
pkill -f "tsx watch" 2>/dev/null || true
sleep 1

# Start API with verbose logs in background
echo "  Starting API with LOG_LEVEL=debug..."
(cd apps/api && LOG_LEVEL=debug pnpm dev 2>&1 | tee ../../.artifacts/puts.txt.raw) &
API_PID=$!
sleep 3

# Calculate time window (last 24 hours)
START=$(date -u -v-24H +%FT%TZ 2>/dev/null || date -u -d '24 hours ago' +%FT%TZ)
END=$(date -u +%FT%TZ)

echo "  Time window: $START → $END"
echo "  Calling: $PUB/v1/formulas/recompute"
echo ""

# Execute recompute
curl -si -X POST "$PUB/v1/formulas/recompute?auth_token=$REAL_JWT" \
  -H 'content-type: application/json' \
  -d "{\"startDate\":\"$START\",\"endDate\":\"$END\"}" \
  2>&1 | tee .artifacts/recompute_ok.txt

# Wait for logs to flush
sleep 2

# Stop API process
echo ""
echo "  Stopping API and sanitizing logs..."
kill $API_PID 2>/dev/null || pkill -f "@xcfe/api" 2>/dev/null || true
sleep 1

# Sanitize logs - redact auth tokens
if [ -f .artifacts/puts.txt.raw ]; then
  cat .artifacts/puts.txt.raw \
    | sed 's/\(auth_token=\)[^&"[:space:]]*/\1***REDACTED***/g' \
    | sed 's/\(Authorization: Bearer \)[^[:space:]]*/\1***REDACTED***/g' \
    | sed 's/\(X-Api-Key: \)[^[:space:]]*/\1***REDACTED***/g' \
    > .artifacts/puts.txt

  rm -f .artifacts/puts.txt.raw
  echo "✓ Logs sanitized"
else
  echo "⚠ No raw logs found"
  touch .artifacts/puts.txt
fi

# Step 7: Summarize
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    E2E SUMMARY                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

CODE=$(awk 'tolower($0) ~ /^http\/.* [0-9]{3}/ {print $2; exit}' .artifacts/recompute_ok.txt 2>/dev/null || echo "N/A")
EVALUATED=$(grep -Eo '"evaluated":[0-9]+' .artifacts/recompute_ok.txt 2>/dev/null | head -1 | cut -d: -f2 || echo "unknown")
UPDATED=$(grep -Eo '"updated":[0-9]+' .artifacts/recompute_ok.txt 2>/dev/null | head -1 | cut -d: -f2 || echo "unknown")

echo "BASE_URL:          $PUB"
echo "HTTP STATUS:       $CODE"
echo "ENTRIES EVALUATED: $EVALUATED"
echo "ENTRIES UPDATED:   $UPDATED"
echo ""
echo "ARTIFACTS:"
echo "  ✓ .artifacts/recompute_ok.txt"
echo "  ✓ .artifacts/puts.txt"
echo ""

# Interpret result
case "$CODE" in
  200)
    echo "✓ SUCCESS - E2E test passed!"
    echo ""
    echo "Next steps:"
    echo "  1. Review .artifacts/recompute_ok.txt for full response"
    echo "  2. Review .artifacts/puts.txt for API logs"
    echo "  3. Verify custom fields in Clockify UI"
    ;;
  401)
    echo "✗ FAILED - Unauthorized (401)"
    echo ""
    echo "Fix: Refresh Clockify page, copy fresh JWT, re-run script"
    exit 1
    ;;
  429)
    RETRY_AFTER=$(grep -i "retry-after:" .artifacts/recompute_ok.txt 2>/dev/null | awk '{print $2}' | tr -d '\r' || echo "60")
    echo "✗ FAILED - Rate Limited (429)"
    echo ""
    echo "Fix: Wait $RETRY_AFTER seconds, then re-run script"
    exit 1
    ;;
  502)
    echo "✗ FAILED - Bad Gateway (502)"
    echo ""
    echo "Fix: Check .artifacts/puts.txt, verify BASE_URL matches manifest"
    exit 1
    ;;
  5*)
    echo "✗ FAILED - Server Error ($CODE)"
    echo ""
    echo "Fix: Check .artifacts/puts.txt for details"
    exit 1
    ;;
  *)
    echo "⚠ Unexpected status: $CODE"
    echo ""
    echo "Check .artifacts/recompute_ok.txt for details"
    ;;
esac

echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

exit 0
