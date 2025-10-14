#!/usr/bin/env bash
#
# STEP 8 E2E TEST - EXECUTION WRAPPER
# Run this script to complete E2E testing with real iframe JWT
#

set -euo pipefail

cd "$(dirname "$0")"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║            STEP 8 E2E TEST - FINAL EXECUTION                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if automation script exists
if [ -x scripts/complete_e2e.sh ]; then
  echo "✓ Complete E2E automation script found"
  echo ""
  echo "This script will:"
  echo "  1. Check local server"
  echo "  2. Request tunnel URL (ngrok/cloudflared)"
  echo "  3. Update .env with public BASE_URL"
  echo "  4. Guide manifest upload to Clockify"
  echo "  5. Guide add-on installation"
  echo "  6. Request iframe JWT (secure input)"
  echo "  7. Execute recompute for last 24h"
  echo "  8. Generate artifacts:"
  echo "     • .artifacts/recompute_ok.txt"
  echo "     • .artifacts/puts.txt"
  echo "  9. Display results summary"
  echo ""
  read -p "Press ENTER to start E2E test (or Ctrl+C to cancel)..."
  echo ""

  # Execute the automation
  ./scripts/complete_e2e.sh

  exit_code=$?
  echo ""
  if [ $exit_code -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    ✓ E2E TEST COMPLETE                         ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Artifacts generated:"
    echo "  ✓ .artifacts/recompute_ok.txt"
    echo "  ✓ .artifacts/puts.txt"
    echo ""
    echo "Next steps:"
    echo "  1. Review artifacts for results"
    echo "  2. Verify custom fields updated in Clockify UI"
    echo "  3. Test verify endpoint if needed"
    echo ""
  else
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    ✗ E2E TEST FAILED                           ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Check error messages above for details."
    echo "Common issues:"
    echo "  • JWT expired → Copy fresh token from browser"
    echo "  • Tunnel not running → Start ngrok/cloudflared"
    echo "  • Rate limited → Wait and retry"
    echo ""
  fi

  exit $exit_code
else
  echo "✗ Automation script not found!"
  echo ""
  echo "Expected: scripts/complete_e2e.sh"
  echo ""
  exit 1
fi
