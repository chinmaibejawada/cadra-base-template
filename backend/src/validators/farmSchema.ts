import { z } from 'zod';

export const createFarmSchema = z.object({
  name: z.string().min(1, 'Farm name is required').max(255),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  zipCode: z.string().max(20).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
});

export const updateFarmSchema = createFarmSchema.partial();

export type CreateFarmInput = z.infer<typeof createFarmSchema>;
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;