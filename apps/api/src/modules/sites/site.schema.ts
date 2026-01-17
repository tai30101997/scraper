import { z } from 'zod';

export const CreateSiteSchema = z.object({
  urls: z.array(z.string().url("Invalid URL format")).nonempty("URL array cannot be empty"),
});

export type CreateSiteInput = z.infer<typeof CreateSiteSchema>;