#!/usr/bin/env bash
set -euo pipefail

# E2E Test Script for xCustomFieldExpander
# Completes Step 8: Real JWT testing with recompute endpoint

# Load environment
if [ -f .env ]; then
  source .env
fi

BASE_URL="${BASE_URL:-http://localhost:8080}"
PORT="${PORT:-8080}"

echo "=== xCFE E2E Test - Step 8 ==="
echo ""

# Step 1: Ensure artifacts dir
mkdir -p .artifacts
echo "✓ Artifacts directory ready"

# Step 2: Check server health
echo ""
echo "Checking server health..."
if curl -sS -f -I "http://localhost:${PORT}/ui/sidebar?auth_token=test" > /dev/null 2>&1; then
  echo "✓ Local server running on http://localhost:${PORT}"
else
  echo "✗ Local server not responding on port ${PORT}"
  echo "  Run: pnpm dev (or cd apps/api && pnpm dev)"
  exit 1
fi

# Step 3: Check if BASE_URL is localhost
if [[ "${BASE_URL}" == http://localhost:* ]] || [[ "${BASE_URL}" == http://127.0.0.1:* ]]; then
  echo ""
  echo "⚠️  BASE_URL is localhost - add-on must be publicly accessible for Clockify"
  echo ""
  echo "To expose server, run ONE of:"
  echo "  • ngrok http ${PORT}"
  echo "  • cloudflared tunnel --url http://localhost:${PORT}"
  echo ""
  echo "Then:"
  echo "  1. Update BASE_URL in .env with the public HTTPS URL"
  echo "  2. Restart dev server (pnpm dev)"
  echo "  3. Re-run this script"
  echo ""
  read -p "Press ENTER if you've already exposed the server and want to continue..."
fi

# Step 4: Installation instructions
echo ""
echo "=== Installation Instructions ==="
echo ""
echo "If add-on is NOT yet installed:"
echo ""
echo "1. Developer Console:"
echo "   https://marketplace.clockify.me/apps/console"
echo "   → Upload manifest: ${BASE_URL}/manifest.json"
echo "   → Save and deploy"
echo ""
echo "2. Install to Workspace:"
echo "   Clockify → Settings → Integrations → Add-ons"
echo "   → Find 'xCustom Field Expander'"
echo "   → Click 'Install'"
echo ""
echo "3. Open Sidebar:"
echo "   Clockify Time Tracker → Sidebar"
echo "   → Click 'xCFE' or 'xCustom Field Expander'"
echo ""
echo "4. Extract JWT:"
echo "   → Open browser DevTools (F12)"
echo "   → Network tab → filter 'sidebar'"
echo "   → Find: /ui/sidebar?auth_token=eyJ..."
echo "   → Copy entire auth_token value"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 5: Prompt for JWT
if [ -z "${REAL_JWT:-}" ]; then
  echo "Paste iframe auth_token JWT (input will be hidden):"
  echo -n "> "
  stty -echo
  read -r REAL_JWT
  stty echo
  echo ""
  echo ""
fi

if [ -z "${REAL_JWT}" ]; then
  echo "✗ No JWT provided, exiting"
  exit 1
fi

# Validate JWT format (basic check)
if [[ ! "${REAL_JWT}" =~ ^eyJ ]]; then
  echo "✗ Invalid JWT format (should start with 'eyJ')"
  exit 1
fi

echo "✓ JWT received (${#REAL_JWT} chars)"

# Step 6: Compute time window and call recompute
echo ""
echo "=== Running Recompute ==="
echo ""

START=$(date -u -v-24H +%FT%TZ 2>/dev/null || date -u -d '24 hours ago' +%FT%TZ)
END=$(date -u +%FT%TZ)

echo "Time window: ${START} → ${END}"
echo "Endpoint: ${BASE_URL}/v1/formulas/recompute"
echo ""

# Make the request
HTTP_RESPONSE=$(curl -si -X POST "${BASE_URL}/v1/formulas/recompute?auth_token=${REAL_JWT}" \
  -H 'content-type: application/json' \
  -d "{\"startDate\":\"${START}\",\"endDate\":\"${END}\"}" \
  2>&1 || true)

# Save to artifact
echo "${HTTP_RESPONSE}" | tee .artifacts/recompute_ok.txt > /dev/null

# Step 7: Parse result and print summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "=== E2E TEST SUMMARY ==="
echo ""

CODE=$(echo "${HTTP_RESPONSE}" | awk 'tolower($0) ~ /^http\/.* [0-9]{3}/ {print $2; exit}')
EVALUATED=$(echo "${HTTP_RESPONSE}" | grep -Eo '"evaluated":[0-9]+' | head -1 | cut -d: -f2 || echo "0")
UPDATED=$(echo "${HTTP_RESPONSE}" | grep -Eo '"updated":[0-9]+' | head -1 | cut -d: -f2 || echo "0")

echo "BASE_URL:         ${BASE_URL}"
echo "HTTP Status:      ${CODE:-N/A}"
echo "Entries evaluated: ${EVALUATED:-unknown}"
echo "Entries updated:   ${UPDATED:-unknown}"
echo ""
echo "Artifact saved:   .artifacts/recompute_ok.txt"
echo ""

# Interpret result
case "${CODE}" in
  200)
    echo "✓ SUCCESS - Recompute completed"
    ;;
  401)
    echo "✗ FAILED - Unauthorized (401)"
    echo ""
    echo "Possible causes:"
    echo "  • JWT expired (token lifetime ~30 min)"
    echo "  • Wrong workspace or user"
    echo "  • Signature verification failed"
    echo ""
    echo "Fix:"
    echo "  1. Refresh Clockify page"
    echo "  2. Open sidebar again (F12 → Network → copy new auth_token)"
    echo "  3. Re-run this script with new JWT"
    ;;
  429)
    RETRY_AFTER=$(echo "${HTTP_RESPONSE}" | grep -i "retry-after:" | awk '{print $2}' | tr -d '\r')
    echo "✗ FAILED - Rate Limited (429)"
    echo ""
    echo "Retry-After: ${RETRY_AFTER:-unknown} seconds"
    echo ""
    echo "Fix:"
    echo "  • Wait ${RETRY_AFTER:-60} seconds"
    echo "  • Re-run script: ./scripts/e2e_test.sh"
    ;;
  502)
    echo "✗ FAILED - Bad Gateway (502)"
    echo ""
    echo "Possible causes:"
    echo "  • Upstream Clockify API returned non-JSON"
    echo "  • Network issue between add-on and Clockify"
    echo "  • BASE_URL mismatch with manifest"
    echo ""
    echo "Check:"
    echo "  • Server logs for upstream errors"
    echo "  • .artifacts/recompute_ok.txt for error details"
    ;;
  5*)
    echo "✗ FAILED - Server Error (${CODE})"
    echo ""
    echo "Check server logs and .artifacts/recompute_ok.txt"
    ;;
  *)
    echo "⚠️  Unexpected status: ${CODE:-N/A}"
    echo ""
    echo "Check .artifacts/recompute_ok.txt for details"
    ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show response body if failed
if [[ "${CODE}" != "200" ]]; then
  echo "Response body:"
  echo "${HTTP_RESPONSE}" | sed '1,/^\r$/d'
  echo ""
fi

exit 0
