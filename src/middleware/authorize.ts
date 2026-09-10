import { Request, Response, NextFunction } from 'express';
import { Role } from '../utils/constants';
import { ApiError } from '../utils/ApiError';

/**
 * Role-based authorization middleware factory.
 * Usage: authorize(Role.WORKER), authorize(Role.ADMIN, Role.CUSTOMER)
 *
 * IMPORTANT: Must be used AFTER authenticate middleware.
 * Never trusts role from the frontend — relies solely on decoded JWT payload.
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};
