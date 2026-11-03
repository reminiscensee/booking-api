import { z } from 'zod';

export const createAppointmentSchema = z.object({
        slot_id: z.number().int().positive(),
        service_id: z.number().int().positive(),
        customer_name: z.string().trim().min(2, 'Name must be at least 2 characters'),
        customer_phone: z.string().regex(/^\+?\d{10,15}$/, 'Invalid phone number format'),
        customer_email: z.string().email().optional()
})

export const getAdminAppointmentsQuerySchema = z.object({
    date: z.string().date(),
    status: z.enum(['pending', 'confirmed', 'cancelled']).optional()
});

export type createAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type getAdminAppointmentsInput = z.infer<typeof getAdminAppointmentsQuerySchema>;