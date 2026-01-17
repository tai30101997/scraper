import { z } from 'zod';

export const GetMediaSchema = z.object({
  page: z.preprocess((val) => Number(val) || 1, z.number().min(1)),
  limit: z.preprocess((val) => Number(val) || 20, z.number().min(1).max(100)),
  type: z.enum(['image', 'video']).optional(),
  search: z.string().optional(),
});

export type GetMediaQuery = z.infer<typeof GetMediaSchema>;