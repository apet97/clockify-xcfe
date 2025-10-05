#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Starting PostgreSQL with Docker Compose..."
cd "$ROOT_DIR"
docker compose up -d

echo "Waiting for PostgreSQL to be ready..."
# Wait for postgres to be ready
sleep 5

# Set default DATABASE_URL if not provided
export DATABASE_URL="${DATABASE_URL:-postgres://xcfe:password@localhost:5432/xcfe_dev}"

echo "Running database migrations..."
"$SCRIPT_DIR/migrate.sh"

echo "Database setup complete!"