CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS settings (
  workspace_id TEXT PRIMARY KEY,
  region TEXT,
  strict_mode BOOLEAN DEFAULT FALSE,
  backfill_months INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS formulas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id TEXT NOT NULL,
  field_key TEXT NOT NULL,
  expr TEXT NOT NULL,
  priority INTEGER DEFAULT 100,
  on_events TEXT[] DEFAULT '{NEW_TIME_ENTRY,TIME_ENTRY_UPDATED}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS formulas_workspace_field_key_idx ON formulas (workspace_id, field_key);
CREATE INDEX IF NOT EXISTS formulas_workspace_priority_idx ON formulas (workspace_id, priority);

CREATE TABLE IF NOT EXISTS dictionaries (
  field_key TEXT PRIMARY KEY,
  allowed_values JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id TEXT,
  user_id TEXT,
  ts TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL,
  ms INTEGER,
  diff JSONB
);

CREATE INDEX IF NOT EXISTS runs_ts_idx ON runs (ts DESC);

-- Add-on installations table for marketplace lifecycle management
CREATE TABLE IF NOT EXISTS installations (
  addon_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  installation_token TEXT,
  status TEXT DEFAULT 'ACTIVE',
  settings_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (addon_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS installations_workspace_idx ON installations (workspace_id);
CREATE INDEX IF NOT EXISTS installations_status_idx ON installations (status);
