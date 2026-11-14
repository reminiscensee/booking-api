import { pool } from "../db/pool.js";
import { AppError } from "../errors/app.error.js";
import type { createSlotInput, generateSlotsSchemaInput, updateSlotInput } from "../schemas/slot.schema.js";

const SLOT_DURATION_MINUTES = 30;

export async function createSlot(data: createSlotInput) {
    const startsAt = new Date(data.starts_at);
    const endsAt = new Date(startsAt);
    endsAt.setMinutes(endsAt.getMinutes() + SLOT_DURATION_MINUTES);

    const query = "INSERT INTO time_slots (starts_at, ends_at) VALUES ($1, $2) RETURNING *"
    const values = [startsAt, endsAt];

    const result = await pool.query(query, values);

    return result.rows[0];
};

export async function updateSlot(id: number, data: updateSlotInput) {
    const query = "UPDATE time_slots SET is_blocked = $1 WHERE id = $2 RETURNING *"
    const values = [data.is_blocked, id]

    const result = await pool.query(query, values);

    if(!result.rows[0]) {
        throw new AppError('Slot not found', 404);
    }
    return result.rows[0];
};
export async function getAvailableSlots(date: string) {
    const query = "SELECT * FROM time_slots  WHERE (starts_at AT TIME ZONE 'Europe/Kyiv')::date = $1::date AND is_blocked = false AND starts_at > NOW() AND NOT EXISTS (SELECT 1 FROM  appointments WHERE appointments.slot_id = time_slots.id AND status IN ('pending', 'confirmed')) ORDER BY starts_at ASC"
    const values = [date];

    const result = await pool.query(query, values);
    return result.rows
};
export async function getAdminSlots(date: string) {
    const query = await pool.query("SELECT time_slots.*,  EXISTS (SELECT 1 FROM appointments WHERE appointments.slot_id = time_slots.id AND appointments.status IN ('pending', 'confirmed')) AS is_booked FROM time_slots WHERE (time_slots.starts_at AT TIME ZONE 'Europe/Kyiv')::date = $1::date ORDER BY time_slots.starts_at ASC", [date]);

    const result = query.rows;

    return result;
};
export async function generateSlotByAdmin(data: generateSlotsSchemaInput): Promise<number> {
  const result = await pool.query(
    `INSERT INTO time_slots (starts_at, ends_at)
     SELECT
       (gs AT TIME ZONE 'Europe/Kyiv') AS starts_at,
       ((gs + interval '30 minutes') AT TIME ZONE 'Europe/Kyiv') AS ends_at
     FROM generate_series(0, $2::int - 1) AS day_offset
     CROSS JOIN LATERAL generate_series(
       ($1::date + day_offset) + $3::time,
       ($1::date + day_offset) + $4::time - interval '30 minutes',
       interval '30 minutes'
     ) AS gs
     ON CONFLICT (starts_at) DO NOTHING`,
    [data.start_date, data.days, data.start_time, data.end_time],
  );

  return result.rowCount ?? 0;
}