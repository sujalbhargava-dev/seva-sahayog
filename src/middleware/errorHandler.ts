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
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation error';
    isOperational = true;
  } else if (err.name === 'CastError') {
    // Mongoose bad ObjectId
    statusCode = 400;
    message = 'Invalid ID format';
    isOperational = true;
  } else if ((err as any).code === 11000) {
    // MongoDB duplicate key
    statusCode = 409;
    message = 'Duplicate entry';
    isOperational = true;

    const field = Object.keys((err as any).keyValue || {})[0];
    if (field) {
      message = `${field} already exists`;
    }
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
