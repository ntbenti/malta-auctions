-- Schema for MaltaGovAuctions D1 database

-- Create auction_assets table
CREATE TABLE IF NOT EXISTS auction_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('real_estate', 'vessel', 'currency', 'vehicle')),
  seizure_reason TEXT NOT NULL CHECK (seizure_reason IN ('sanctions', 'debt', 'contraband')),
  un_sanctions_compliance BOOLEAN NOT NULL DEFAULT 1,
  local_court_order TEXT,
  contraband_type TEXT CHECK (contraband_type IN ('drugs', 'weapons', 'currency')),
  imo_number TEXT,
  arrest_warrant_id TEXT,
  description TEXT NOT NULL,
  debt_amount TEXT,
  value TEXT,
  origin TEXT,
  source TEXT NOT NULL,
  date_added TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create asset_serials table for currency serial numbers
CREATE TABLE IF NOT EXISTS asset_serials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  serial_number TEXT NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES auction_assets(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_assets_type ON auction_assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_seizure_reason ON auction_assets(seizure_reason);
CREATE INDEX IF NOT EXISTS idx_assets_sanctions ON auction_assets(un_sanctions_compliance);
CREATE INDEX IF NOT EXISTS idx_assets_source ON auction_assets(source);
