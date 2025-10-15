#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

: "${DATABASE_URL?DATABASE_URL must be set to run migrations}"

psql "$DATABASE_URL" -f "$ROOT_DIR/infra/db.sql"

echo "Database schema applied"
