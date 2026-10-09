import { z } from 'zod';

export const orderLineSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().positive('Quantity must be positive'),
});

export const createOrderSchema = z.object({
  farmId: z.number().int().positive('Farm is required'),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  requestedDeliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  idempotencyKey: z.string().max(255).optional().nullable(),
  lines: z.array(orderLineSchema).min(1, 'At least one order line is required'),
});

export const updateOrderSchema = z.object({
  requestedDeliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  lines: z.array(orderLineSchema).optional(),
});

export const statusTransitionSchema = z.object({
  status: z.enum(['draft', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  actualDeliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>;