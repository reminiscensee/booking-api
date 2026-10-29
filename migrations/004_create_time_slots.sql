CREATE TABLE time_slots (
  id SERIAL PRIMARY KEY,
  starts_at TIMESTAMPTZ NOT NULL UNIQUE,
  ends_at TIMESTAMPTZ NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_time_slots_starts_at UNIQUE (starts_at),
  CONSTRAINT chk_time_slots_duration CHECK (ends_at > starts_at)
); 