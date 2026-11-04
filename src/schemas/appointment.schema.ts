import { z } from 'zod';

const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const

export const createAppointmentSchema = z.object({
        slot_id: z.number().int().positive(),
        service_id: z.number().int().positive(),
        customer_name: z.string().trim().min(2, 'Name must be at least 2 characters'),
        customer_phone: z.string().regex(/^\+?\d{10,15}$/, 'Invalid phone number format'),
        customer_email: z.string().email().optional()
})

export const getAdminAppointmentsQuerySchema = z.object({
    date: z.string().date(),
    status: z.enum(APPOINTMENT_STATUSES).optional()
});

export const updateAppointmentsStatusSchema = z.object({
    status: z.enum(APPOINTMENT_STATUSES)
});
export const appointmentIdSchema = z.object({
  id: z.coerce.number().int().positive()
});


export type createAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type getAdminAppointmentsInput = z.infer<typeof getAdminAppointmentsQuerySchema>;
export type updateAppointmentsStatusInput = z.infer<typeof updateAppointmentsStatusSchema>;