import { z } from 'zod';

export const searchWorkersSchema = z.object({
  service: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().max(100).optional(),
  availability: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  language: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
