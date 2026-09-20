import { Router } from 'express';
import * as workerController from '../controllers/worker.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { Role } from '../utils/constants';
import {
  updateProfileSchema,
  updateLocationSchema,
  updateAvailabilitySchema,
  addSkillsSchema,
} from '../validators/worker.validator';

const router = Router();

// Protected worker routes (MUST be before /:id to avoid route conflicts)
router.patch(
  '/profile',
  authenticate,
  authorize(Role.WORKER),
  validate(updateProfileSchema),
  workerController.updateProfile
);

router.patch(
  '/location',
  authenticate,
  authorize(Role.WORKER),
  validate(updateLocationSchema),
  workerController.updateLocation
);

router.patch(
  '/availability',
  authenticate,
  authorize(Role.WORKER),
  validate(updateAvailabilitySchema),
  workerController.updateAvailability
);

router.post(
  '/skills',
  authenticate,
  authorize(Role.WORKER),
  validate(addSkillsSchema),
  workerController.addSkills
);

router.delete(
  '/skills/:skill',
  authenticate,
  authorize(Role.WORKER),
  workerController.removeSkill
);

router.get(
  '/jobs',
  authenticate,
  authorize(Role.WORKER),
  workerController.getWorkerJobs
);

router.get(
  '/earnings',
  authenticate,
  authorize(Role.WORKER),
  workerController.getWorkerEarnings
);

router.get(
  '/analytics',
  authenticate,
  authorize(Role.WORKER),
  workerController.getWorkerAnalytics
);

router.get(
  '/reviews',
  authenticate,
  authorize(Role.WORKER),
  workerController.getWorkerReviews
);

router.post(
  '/verification/video',
  authenticate,
  authorize(Role.WORKER),
  upload.single('video'),
  workerController.uploadVerificationVideo
);

router.get(
  '/verification/status',
  authenticate,
  authorize(Role.WORKER),
  workerController.getVerificationStatus
);

// Public routes (must be LAST — /:id is a wildcard that catches everything)
router.get('/', workerController.getWorkers);
router.get('/:id', workerController.getWorkerById);

export default router;
