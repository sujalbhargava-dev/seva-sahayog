import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { Role } from '../utils/constants';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(Role.CUSTOMER),
  validate(createReviewSchema),
  reviewController.createReview
);

router.get('/worker/:workerId', reviewController.getWorkerReviews);

export default router;
