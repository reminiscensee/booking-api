import { z } from 'zod';

export const serviceIdSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const createServiceSchema = z.object({
  name: z.string().trim().min(1),
  price: z.number().int().min(0),
  description: z.string().optional()
});
export const updateServiceSchema = createServiceSchema
  .partial()
  .extend({is_active: z.boolean().optional() })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;