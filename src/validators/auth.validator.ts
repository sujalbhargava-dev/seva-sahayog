import { z } from 'zod';
import { Role } from '../utils/constants';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'),
  email: z.string().email('Please provide a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
  role: z.enum([Role.CUSTOMER, Role.WORKER], {
    errorMap: () => ({ message: 'Role must be CUSTOMER or WORKER' }),
  }),
  language: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Please provide an email or phone number'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum([Role.CUSTOMER, Role.WORKER, Role.ADMIN]).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
