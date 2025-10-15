#!/usr/bin/env bash
set -euo pipefail

# Complete E2E Test Script - Step 8
# Automates: tunnel setup, manifest publish, JWT capture, recompute, artifact generation

cd "$(dirname "$0")/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }

# Load .env if exists
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

PORT="${PORT:-8080}"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          xCFE E2E Test - Step 8 Complete Workflow             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Ensure artifacts dir
info "Step 1: Creating artifacts directory..."
mkdir -p .artifacts
success "Artifacts directory ready"

# Step 2: Check local health
info "Step 2: Checking local server health..."
if curl -sS -f -I "http://localhost:${PORT}/manifest.json" >/dev/null 2>&1; then
  success "Local server running on port ${PORT}"
else
  error "Local server not responding on port ${PORT}"
  info "Starting dev server..."
  pnpm dev >/dev/null 2>&1 &
  sleep 3
  if curl -sS -f -I "http://localhost:${PORT}/manifest.json" >/dev/null 2>&1; then
    success "Dev server started successfully"
  else
    error "Failed to start dev server. Please run 'pnpm dev' manually."
    exit 1
  fi
fi

# Step 3: Ensure public tunnel
echo ""
info "Step 3: Setting up public tunnel..."

if command -v ngrok >/dev/null 2>&1; then
  warn "ngrok detected. Start tunnel in SEPARATE terminal:"
  echo "   ${BLUE}ngrok http ${PORT}${NC}"
  echo ""
elif command -v cloudflared >/dev/null 2>&1; then
  warn "cloudflared detected. Start tunnel in SEPARATE terminal:"
  echo "   ${BLUE}cloudflared tunnel --url http://localhost:${PORT}${NC}"
  echo ""
else
  error "No tunnel tool found. Install one:"
  echo "   brew install ngrok"
  echo "   brew install cloudflare/cloudflare/cloudflared"
  exit 1
fi

echo "After starting tunnel, copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)"
echo ""
read -p "Paste tunnel HTTPS URL: " PUB

if [[ -z "$PUB" ]]; then
  error "No URL provided, exiting"
  exit 1
fi

# Validate URL format
if [[ ! "$PUB" =~ ^https:// ]]; then
  error "URL must start with https://"
  exit 1
fi

# Remove trailing slash
PUB="${PUB%/}"

success "Public URL: ${PUB}"

# Step 4: Update BASE_URL and restart dev
echo ""
info "Step 4: Updating BASE_URL in .env..."

if [ -f .env ]; then
  cp .env .env.bak.$(date +%s)
  if grep -q "^BASE_URL=" .env; then
    # Update existing BASE_URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^BASE_URL=.*|BASE_URL=${PUB}|" .env
    else
      sed -i "s|^BASE_URL=.*|BASE_URL=${PUB}|" .env
    fi
  else
    # Append BASE_URL
    echo "BASE_URL=${PUB}" >> .env
  fi
else
  # Create new .env
  cat > .env <<EOF
PORT=${PORT}
BASE_URL=${PUB}
ADDON_KEY=xcfe.example
DEV_ALLOW_UNSIGNED=true
LOG_LEVEL=debug
EOF
fi

success ".env updated with BASE_URL=${PUB}"

info "Restarting dev server with new BASE_URL..."
pkill -f "tsx watch" 2>/dev/null || true
sleep 1

# Restart with new env
pnpm dev >/dev/null 2>&1 &
DEV_PID=$!
sleep 3

# Verify public URL is accessible
if curl -sS -f -I "${PUB}/manifest.json" >/dev/null 2>&1; then
  HTTP_STATUS=$(curl -sS -I "${PUB}/manifest.json" 2>&1 | head -n1)
  success "Public URL accessible: ${HTTP_STATUS}"
else
  error "Public URL not accessible. Check tunnel status."
  exit 1
fi

# Step 5: Publish manifest and install (instructions)
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    MANUAL STEPS REQUIRED                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
info "Step 5a: Upload Manifest to Clockify Developer Console"
echo ""
echo "  1. Go to: ${BLUE}https://marketplace.clockify.me/apps/console${NC}"
echo "  2. Create new add-on or update existing"
echo "  3. Set manifest URL: ${GREEN}${PUB}/manifest.json${NC}"
echo "  4. Click 'Save' and 'Deploy'"
echo ""
read -p "Press ENTER when manifest is uploaded and deployed..."

echo ""
info "Step 5b: Install Add-on to Workspace"
echo ""
echo "  1. Go to Clockify workspace"
echo "  2. Settings → Integrations → Add-ons"
echo "  3. Find 'xCustom Field Expander'"
echo "  4. Click 'Install'"
echo ""
read -p "Press ENTER when add-on is installed..."

# Step 6: Capture iframe JWT
echo ""
info "Step 6: Capture iframe JWT"
echo ""
echo "  1. Open Clockify time tracker"
echo "  2. Click on 'xCFE' or 'xCustom Field Expander' sidebar"
echo "  3. Open DevTools (F12)"
echo "  4. Go to Network tab"
echo "  5. Filter: 'sidebar'"
echo "  6. Find request: ${GREEN}/ui/sidebar?auth_token=eyJ...${NC}"
echo "  7. Copy the entire ${GREEN}auth_token${NC} value (starts with eyJ)"
echo ""
echo "JWT input will be hidden for security:"
echo -n "> "
stty -echo
read -r REAL_JWT
stty echo
echo ""
echo ""

if [[ -z "$REAL_JWT" ]]; then
  error "No JWT provided, exiting"
  exit 1
fi

if [[ ! "$REAL_JWT" =~ ^eyJ ]]; then
  error "Invalid JWT format (should start with 'eyJ')"
  exit 1
fi

success "JWT captured (${#REAL_JWT} chars)"

# Step 7: Start API with verbose logs
echo ""
info "Step 7: Starting API server with verbose logging..."

# Stop existing processes
pkill -f "@xcfe/api" 2>/dev/null || true
pkill -f "tsx watch" 2>/dev/null || true
sleep 1

# Start with log capture
export LOG_LEVEL=debug
export BASE_URL="${PUB}"

(cd apps/api && pnpm dev 2>&1 | tee ../../.artifacts/puts.txt.raw) &
API_PID=$!
sleep 3

success "API server started (PID: ${API_PID})"

# Step 8: Run recompute
echo ""
info "Step 8: Running recompute for last 24 hours..."

START=$(date -u -v-24H +%FT%TZ 2>/dev/null || date -u -d '24 hours ago' +%FT%TZ)
END=$(date -u +%FT%TZ)

info "Time window: ${START} → ${END}"
info "Endpoint: ${PUB}/v1/formulas/recompute"
echo ""

# Execute recompute
HTTP_RESPONSE=$(curl -si -X POST "${PUB}/v1/formulas/recompute?auth_token=${REAL_JWT}" \
  -H 'content-type: application/json' \
  -d "{\"startDate\":\"${START}\",\"endDate\":\"${END}\"}" \
  2>&1 || true)

# Save to artifact
echo "${HTTP_RESPONSE}" | tee .artifacts/recompute_ok.txt >/dev/null

# Wait a bit more for logs to flush
sleep 2

# Step 9: Stop API and sanitize logs
info "Step 9: Stopping API server and sanitizing logs..."

kill $API_PID 2>/dev/null || pkill -f "@xcfe/api" 2>/dev/null || true
sleep 1

# Sanitize logs - redact sensitive tokens
if [ -f .artifacts/puts.txt.raw ]; then
  cat .artifacts/puts.txt.raw \
    | sed 's/\(auth_token=\)[^&"\]* /\1***REDACTED*** /g' \
    | sed 's/\(auth_token=\)[^&"\]*$/\1***REDACTED***/g' \
    | sed 's/\(Authorization: Bearer \)[^ ]*/\1***REDACTED***/g' \
    | sed 's/\(X-Api-Key: \)[^ ]*/\1***REDACTED***/g' \
    | grep -i "PUT\|PATCH\|formula\|custom.*field" \
    > .artifacts/puts.txt || echo "# No matching log lines found" > .artifacts/puts.txt

  rm -f .artifacts/puts.txt.raw
  success "Logs sanitized and saved to .artifacts/puts.txt"
else
  warn "No raw logs found"
fi

# Step 10: Parse results and generate summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     E2E TEST SUMMARY                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

CODE=$(awk 'tolower($0) ~ /^http\/.* [0-9]{3}/ {print $2; exit}' .artifacts/recompute_ok.txt 2>/dev/null || echo "N/A")
EVALUATED=$(grep -Eo '"evaluated":[0-9]+' .artifacts/recompute_ok.txt 2>/dev/null | head -1 | cut -d: -f2 || echo "unknown")
UPDATED=$(grep -Eo '"updated":[0-9]+' .artifacts/recompute_ok.txt 2>/dev/null | head -1 | cut -d: -f2 || echo "unknown")

echo "PUBLIC URL:        ${GREEN}${PUB}${NC}"
echo "HTTP STATUS:       ${CODE}"
echo "ENTRIES EVALUATED: ${EVALUATED}"
echo "ENTRIES UPDATED:   ${UPDATED}"
echo ""
echo "ARTIFACTS:"
echo "  ✓ .artifacts/recompute_ok.txt  (HTTP response)"
echo "  ✓ .artifacts/puts.txt          (sanitized logs)"
echo ""

# Interpret result
case "${CODE}" in
  200)
    success "E2E TEST PASSED - Recompute completed successfully!"
    echo ""
    info "Next steps:"
    echo "  1. Verify updated entries in Clockify UI"
    echo "  2. Test verify endpoint: curl \"${PUB}/v1/formulas/verify?auth_token=\${JWT}&entryId=<id>\""
    echo "  3. Review .artifacts/puts.txt for PUT/PATCH requests"
    ;;
  401)
    error "E2E TEST FAILED - Unauthorized (401)"
    echo ""
    echo "Possible causes:"
    echo "  • JWT expired (lifetime ~30 minutes)"
    echo "  • Wrong workspace or addon key"
    echo "  • Signature verification failed"
    echo ""
    echo "Fix:"
    echo "  1. Refresh Clockify page"
    echo "  2. Open sidebar again (copy new auth_token)"
    echo "  3. Re-run: ./scripts/complete_e2e.sh"
    ;;
  429)
    RETRY_AFTER=$(grep -i "retry-after:" .artifacts/recompute_ok.txt 2>/dev/null | awk '{print $2}' | tr -d '\r' || echo "60")
    error "E2E TEST FAILED - Rate Limited (429)"
    echo ""
    echo "Retry-After: ${RETRY_AFTER} seconds"
    echo ""
    echo "Fix:"
    echo "  sleep ${RETRY_AFTER}"
    echo "  ./scripts/complete_e2e.sh"
    ;;
  502)
    error "E2E TEST FAILED - Bad Gateway (502)"
    echo ""
    echo "Possible causes:"
    echo "  • Upstream Clockify API returned non-JSON"
    echo "  • Network issue"
    echo "  • BASE_URL mismatch with manifest"
    echo ""
    echo "Check .artifacts/recompute_ok.txt and .artifacts/puts.txt for details"
    ;;
  5*)
    error "E2E TEST FAILED - Server Error (${CODE})"
    echo ""
    echo "Check .artifacts/recompute_ok.txt and .artifacts/puts.txt for details"
    ;;
  *)
    warn "Unexpected HTTP status: ${CODE}"
    echo ""
    echo "Check .artifacts/recompute_ok.txt for response details"
    ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Show response body if not 200
if [[ "${CODE}" != "200" ]]; then
  info "Response body:"
  echo ""
  sed '1,/^\r$/d' .artifacts/recompute_ok.txt 2>/dev/null || cat .artifacts/recompute_ok.txt
  echo ""
fi

exit 0
