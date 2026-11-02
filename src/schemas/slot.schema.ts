import { z } from "zod";
export const createSlotSchema = z.object({
    starts_at: z.string().datetime({ offset: true }).refine((val) => { 
        const d = new Date(val);
        return (d.getMinutes() === 0 || d.getMinutes() === 30) && d.getSeconds() === 0;
    }, { message: 'Start time must be on the hour or half-hour (e.g. 10:00, 10:30)' })
});

export const updateSlotSchema = z.object({
    is_blocked: z.boolean()
});

export const slotIdSchema = z.object({
    id: z.coerce.number().int().positive()
})

export const getSlotsQuerySchema = z.object({
    date: z.string().date()
})

export type createSlotInput = z.infer<typeof createSlotSchema>;
export type updateSlotInput = z.infer<typeof updateSlotSchema>;
export type getSlotsQueryInput = z.infer<typeof getSlotsQuerySchema>;