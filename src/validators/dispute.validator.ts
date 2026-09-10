import { z } from 'zod';

export const raiseDisputeSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const resolveDisputeSchema = z.object({
  resolution: z.string().min(10, 'Resolution must be at least 10 characters'),
});
