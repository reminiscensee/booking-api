# Database Design

## Architectural Decisions

1. **Partial Unique Index on Appointments:**
   - **Decision:** `CREATE UNIQUE INDEX unique_active_appointment_slot ON appointments (slot_id) WHERE status IN ('pending', 'confirmed');`
   - **Why:** Prevents double booking on active records while allowing cancelled appointments to remain in history and freeing the slot for new clients.

2. **Service Deactivation instead of Hard Delete:**
   - **Decision:** Foreign keys use `ON DELETE RESTRICT`, and services have an `is_active` boolean flag.
   - **Why:** Preserves historical financial and booking records by preventing destructive deletes of referenced services.

3. **Timestamps with Time Zone:**
   - **Decision:** All datetime columns use `TIMESTAMPTZ`.
   - **Why:** Avoids timezone shifting bugs by storing absolute points in time normalized to UTC.

4. **Status Constraints:**
   - **Decision:** `TEXT` column combined with a `CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))` constraint.
   - **Why:** Enforces strict validation at the database level while remaining simpler to migrate and modify than PostgreSQL `ENUM` types.

5. **Unique Slot Start Times:**
   - **Decision:** `UNIQUE (starts_at)` constraint on `time_slots`.
   - **Why:** Prevents duplicate slot start times from being generated for a single specialist.

---

## Schema Overview

- **`admin_users`**: `id` (SERIAL PK), `email` (TEXT NOT NULL UNIQUE), `password_hash` (TEXT NOT NULL), `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW()).
- **`services`**: `id` (SERIAL PK), `name` (TEXT NOT NULL), `description` (TEXT NULL), `price` (INTEGER NOT NULL CHECK (price >= 0)), `is_active` (BOOLEAN NOT NULL DEFAULT TRUE), `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW()).
- **`customers`**: `id` (SERIAL PK), `name` (TEXT NOT NULL), `phone` (TEXT NOT NULL), `email` (TEXT NULL), `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW()).
- **`time_slots`**: `id` (SERIAL PK), `starts_at` (TIMESTAMPTZ NOT NULL UNIQUE), `ends_at` (TIMESTAMPTZ NOT NULL), `is_blocked` (BOOLEAN NOT NULL DEFAULT FALSE), `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW()), `CHECK (ends_at > starts_at)`.
- **`appointments`**: `id` (SERIAL PK), `slot_id` (INTEGER NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT), `customer_id` (INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT), `service_id` (INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT), `status` (TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))), `notes` (TEXT NULL), `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW()).