import { z } from 'zod';

export const createNoteSchema = z.object({
  notableType: z.enum(['order', 'farm', 'product']),
  notableId: z.number().int().positive(),
  content: z.string().min(1, 'Note content is required').max(5000),
  author: z.string().max(255).optional().nullable(),
  isInternal: z.boolean().optional().default(false),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;