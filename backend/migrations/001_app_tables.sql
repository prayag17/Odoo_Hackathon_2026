-- TransitOps app tables. Plain SQL, no ORM. Safe to re-run (everything below
-- uses IF NOT EXISTS). This file only owns the app's own tables — it does NOT
-- touch better-auth's "user" table. The "role" column on "user" is a
-- better-auth additionalField (see auth.js) and must be applied with
-- better-auth's own CLI instead of a hand-written ALTER TABLE:
--
--   pnpm dlx @better-auth/cli generate -y
--
-- That command introspects the live schema before writing anything, so it's
-- safe to run again later (it'll just report "schema is already up to date"
-- if the column is already there) — unlike a raw ALTER TABLE ... ADD
-- CONSTRAINT, which errors on a second run.

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  registration_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  max_load_capacity NUMERIC NOT NULL DEFAULT 0,
  odometer NUMERIC NOT NULL DEFAULT 0,
  acquisition_cost NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Available'
    CHECK (status IN ('Available', 'On Trip', 'In Shop', 'Retired')),
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  license_category TEXT,
  license_expiry_date DATE,
  contact_number TEXT,
  safety_score NUMERIC NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'Available'
    CHECK (status IN ('Available', 'On Trip', 'Off Duty', 'Suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  driver_id INTEGER NOT NULL REFERENCES drivers(id),
  cargo_weight NUMERIC NOT NULL DEFAULT 0,
  planned_distance NUMERIC,
  actual_distance NUMERIC,
  fuel_consumed NUMERIC,
  status TEXT NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  description TEXT NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Open'
    CHECK (status IN ('Open', 'Closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  liters NUMERIC NOT NULL,
  cost NUMERIC NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_vehicle_id ON maintenance_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_vehicle_id ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle_id ON expenses(vehicle_id);
