CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT('pending'),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_appointments_slot FOREIGN KEY (slot_id) REFERENCES time_slots(id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
  
  CONSTRAINT chk_appointments_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
);
CREATE UNIQUE INDEX uq_appointments_active_slot ON appointments (slot_id) WHERE status IN ('pending', 'confirmed');