import { pool } from "../db/pool.js";
import { AppError } from "../errors/app.error.js";
import type { createAppointmentInput } from "../schemas/appointment.schema.js";

export async function createAppointment(data: createAppointmentInput) {
     const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const selectedService = await client.query("SELECT * FROM services WHERE id = $1", [data.service_id]);

        const service = selectedService.rows[0];

        if (!service || !service.is_active) {
            throw new AppError('Service not found or inactive', 404);
        };

        const selectedSlot = await client.query("SELECT * FROM time_slots WHERE id = $1", [data.slot_id]);

        const slot = selectedSlot.rows[0];

        if (!slot) {
            throw new AppError('Time slot not found', 404);
        };

        if (slot.is_blocked || new Date(slot.starts_at) <= new Date()) {
            throw new AppError('Time slot is unavailable or in the past', 409);
        };

        const insertCustomers = await client.query("INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3) RETURNING id", [data.customer_name, data.customer_phone, data.customer_email ?? null]);

        const customerId = insertCustomers.rows[0].id;

        const result = await client.query("INSERT INTO appointments (slot_id, service_id, customer_id, status) VALUES ($1, $2, $3, 'pending') RETURNING *", [data.slot_id, data.service_id, customerId]);

        await client.query('COMMIT')

        return result.rows[0];
    } catch (e) {
        await client.query('ROLLBACK');
        throw e
    } finally {
        client.release();
    };
}