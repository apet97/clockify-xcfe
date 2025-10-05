#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required. Enable it via \"corepack enable pnpm\"." >&2
  exit 1
fi

cd "$ROOT_DIR"

if command -v docker >/dev/null 2>&1; then
  docker compose up -d db adminer >/dev/null 2>&1 || docker-compose up -d db adminer >/dev/null 2>&1
fi

pnpm install

DEFAULT_DB="postgres://postgres:postgres@localhost:5432/xcfe"
export DATABASE_URL="${DATABASE_URL:-$DEFAULT_DB}"

bash "$SCRIPT_DIR/migrate.sh"

echo ""
echo "🚀 Starting development servers..."
echo "📖 API:      http://localhost:8080"
echo "🎨 Admin UI: http://localhost:5173"
echo "🐘 Adminer:  http://localhost:8081"
echo ""

exec pnpm -r --filter '@xcfe/*' --parallel dev
