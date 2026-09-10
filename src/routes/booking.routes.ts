import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { Role } from '../utils/constants';
import { createBookingSchema } from '../validators/booking.validator';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post(
  '/',
  authorize(Role.CUSTOMER),
  validate(createBookingSchema),
  bookingController.createBooking
);

router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);

router.patch(
  '/:id/accept',
  authorize(Role.WORKER),
  bookingController.acceptBooking
);

router.patch(
  '/:id/reject',
  authorize(Role.WORKER),
  bookingController.rejectBooking
);

router.patch(
  '/:id/start',
  authorize(Role.WORKER),
  bookingController.startBooking
);

router.patch(
  '/:id/complete',
  authorize(Role.WORKER),
  bookingController.completeBooking
);

router.patch(
  '/:id/cancel',
  authorize(Role.CUSTOMER, Role.WORKER, Role.ADMIN),
  bookingController.cancelBooking
);

export default router;
