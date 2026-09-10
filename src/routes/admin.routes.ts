import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '../utils/constants';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize(Role.ADMIN));

// User management
router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.updateUser);

// Worker verification
router.patch('/workers/verify/:id', adminController.verifyWorker);

// Skill verification / KYC
router.get('/skill-verification', adminController.getSkillVerifications);
router.patch('/skill-verification/:id', adminController.reviewSkillVerification);

// Disputes
router.get('/disputes', adminController.getAdminDisputes);
router.patch('/disputes/:id/resolve', adminController.resolveAdminDispute);

// Bookings
router.get('/bookings', adminController.getAdminBookings);

// Payouts
router.get('/payouts', adminController.getPayouts);

// Platform stats
router.get('/stats', adminController.getPlatformStats);

export default router;
