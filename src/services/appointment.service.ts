import { pool } from "../db/pool.js";
import { AppError } from "../errors/app.error.js";
import type { createAppointmentInput, getAdminAppointmentsInput } from "../schemas/appointment.schema.js";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['cancelled', 'completed'],
        cancelled: [],
        completed: []
};

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

export async function getAppointments(filter: getAdminAppointmentsInput) {
    const a = `SELECT 
                    a.id AS id,
                    a.status,
                    time_slots.starts_at,
                    time_slots.ends_at,
                    services.name AS service_name,
                    customers.name AS customer_name,
                    customers.phone AS customer_phone
                    FROM appointments a
                    JOIN time_slots ON time_slots.id = a.slot_id
                    JOIN services ON services.id = a.service_id
                    JOIN customers ON customers.id = a.customer_id
                    WHERE (time_slots.starts_at AT TIME ZONE 'Europe/Kyiv')::date = $1::date AND ($2::varchar IS NULL OR a.status = $2)
                    ORDER BY time_slots.starts_at ASC`
    const values = [filter.date, filter.status ?? null];

    const result = await pool.query(a, values);
    return result.rows;
}

export async function updateAppointmentStatus(id: number, newStatus: string) {
    
    const query = await pool.query("SELECT appointments.*, time_slots.starts_at  FROM appointments JOIN time_slots ON time_slots.id = appointments.slot_id WHERE appointments.id = $1", [id]);

    const appointment = query.rows[0]

    if (!appointment) {
        throw new AppError('Appointment not found', 404);
    };
    const currentStatus = appointment.status
    
    if(currentStatus === newStatus) {
        return appointment
    };

    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];

    if(!allowed.includes(newStatus)) {
        throw new AppError(`Cannot change status from ${currentStatus} to ${newStatus}`, 409);
    };
    if(newStatus === 'completed' && new Date(appointment.starts_at) > new Date()) {
        throw new AppError('Cannot complete an appointment before its scheduled time', 409)
    }
    const updateResult = await pool.query("UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *",[newStatus, id]);

    return updateResult.rows[0];
}