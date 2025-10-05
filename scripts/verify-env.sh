#!/usr/bin/env bash
set -euo pipefail

REQUIRED_VARS=(
  "DATABASE_URL"
  "WORKSPACE_ID"
  "ENCRYPTION_KEY"
)

MISSING=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    MISSING+=("$var")
  fi
done

if [ "${#MISSING[@]}" -gt 0 ]; then
  echo "Missing required environment variables: ${MISSING[*]}" >&2
  exit 1
fi

if [ -z "${ADDON_TOKEN:-}" ] && [ -z "${API_KEY:-}" ]; then
  echo "Provide either ADDON_TOKEN or API_KEY for Clockify authentication." >&2
  exit 1
fi

echo "Environment looks good."
