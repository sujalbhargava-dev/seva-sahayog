import { Role } from '../utils/constants';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
      };
      t?: (key: string, options?: any) => string;
    }
  }
}

export {};
