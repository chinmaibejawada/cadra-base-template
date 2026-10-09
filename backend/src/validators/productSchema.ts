import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50),
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().max(1000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  unit: z.string().min(1, 'Unit is required').max(50),
  unitPrice: z.number().positive('Price must be positive'),
  currentStock: z.number().min(0).optional().default(0),
  reorderPoint: z.number().min(0).optional().default(0),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;