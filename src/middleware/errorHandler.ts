import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

/**
 * Global error handling middleware.
 * Catches all errors and returns standardized JSON responses.
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default to 500
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any[] = [];
  let isOperational = false;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    isOperational = err.isOperational;
  } else if ((err as any).code === '23505') {
    // Postgres/Supabase duplicate key violation
    statusCode = 409;
    message = 'Duplicate entry';
    isOperational = true;

    // Optional: extract field name from Postgres error details if available
    if ((err as any).details) {
      message = (err as any).details;
    }
  } else if ((err as any).code === '23503') {
    // Postgres/Supabase foreign key violation
    statusCode = 400;
    message = 'Related record not found';
    isOperational = true;
  } else if ((err as any).code === 'PGRST116') {
    // Supabase single row not found
    statusCode = 404;
    message = 'Resource not found';
    isOperational = true;
  }

  // Log non-operational errors (unexpected bugs)
  if (!isOperational) {
    console.error('❌ Unexpected error:', err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
};
