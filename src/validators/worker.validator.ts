import { z } from 'zod';

export const updateProfileSchema = z.object({
  experience: z.number().min(0).optional(),
  cooperativeMember: z.boolean().optional(),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(1, 'Address is required'),
});

export const updateAvailabilitySchema = z.object({
  availability: z.boolean(),
});

export const addSkillsSchema = z.object({
  skills: z
    .array(z.string().min(1))
    .min(1, 'At least one skill is required'),
});
