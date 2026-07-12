-- Adds photo URLs for vehicles and drivers. Safe to re-run.
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS image TEXT;
