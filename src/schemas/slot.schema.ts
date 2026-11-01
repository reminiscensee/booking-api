import { z } from "zod";
export const createSlotSchema = z.object({
    starts_at: z.string().datetime({ offset: true })
});

export const updateSlotSchema = z.object({
    is_blocked: z.boolean()
});

export const slotIdSchema = z.object({
    id: z.coerce.number().int().positive()
})

export type createSlotInput = z.infer<typeof createSlotSchema>;
export type updateSlotInput = z.infer<typeof updateSlotSchema>;