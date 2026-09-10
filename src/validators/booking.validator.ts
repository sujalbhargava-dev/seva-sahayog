import { z } from 'zod';

export const createBookingSchema = z.object({
  workerId: z.string().min(1, 'Worker ID is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().min(1, 'Address is required'),
  }),
  scheduledDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
  scheduledTime: z.string().regex(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    'Time must be in HH:MM format'
  ),
  amount: z.number().positive('Amount must be positive'),
});
