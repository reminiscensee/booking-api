import { pool } from "../db/pool.js";
import { AppError } from "../errors/app.error.js";
import type { createSlotInput, updateSlotInput } from "../schemas/slot.schema.js";

export async function createSlot(data: createSlotInput) {
    const SLOT_DURATION_MINUTES = 30;
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
}