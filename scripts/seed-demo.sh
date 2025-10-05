#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ ! -f "$ROOT_DIR/.env" ]; then
  echo "Missing .env file. Copy .env.sample and configure credentials before seeding." >&2
  exit 1
fi

# shellcheck disable=SC2046
export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL must be set" >&2
  exit 1
fi

if [ -z "${WORKSPACE_ID:-}" ]; then
  echo "WORKSPACE_ID must be set" >&2
  exit 1
fi

psql "$DATABASE_URL" <<SQL
INSERT INTO formulas (workspace_id, field_key, expr, priority, on_events)
VALUES
  ('$WORKSPACE_ID', 'Amount', $$ROUND(Duration.h * CF("Rate"), 2)$$, 10, ARRAY['NEW_TIME_ENTRY','TIME_ENTRY_UPDATED'])
ON CONFLICT (workspace_id, field_key) DO UPDATE SET expr = EXCLUDED.expr, priority = EXCLUDED.priority, on_events = EXCLUDED.on_events;

INSERT INTO formulas (workspace_id, field_key, expr, priority, on_events)
VALUES
  ('$WORKSPACE_ID', 'OTFlag', $$IF(Duration.h > 8, "OT", "REG")$$, 20, ARRAY['TIME_ENTRY_UPDATED'])
ON CONFLICT (workspace_id, field_key) DO UPDATE SET expr = EXCLUDED.expr, priority = EXCLUDED.priority, on_events = EXCLUDED.on_events;

INSERT INTO dictionaries (field_key, allowed_values)
VALUES
  ('OTFlag', '{"type":"dropdown","allowedValues":["REG","OT"],"mode":"warn"}')
ON CONFLICT (field_key) DO UPDATE SET allowed_values = EXCLUDED.allowed_values;

INSERT INTO dictionaries (field_key, allowed_values)
VALUES
  ('Amount', '{"type":"numeric","numericRange":{"min":0},"mode":"warn"}')
ON CONFLICT (field_key) DO UPDATE SET allowed_values = EXCLUDED.allowed_values;
SQL

echo "Demo formulas and dictionaries loaded for workspace $WORKSPACE_ID."
