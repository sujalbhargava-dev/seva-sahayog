import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { Role } from '../utils/constants';
import {
  createOrderSchema,
  verifyPaymentSchema,
} from '../validators/payment.validator';

const router = Router();

router.post(
  '/create-order',
  authenticate,
  authorize(Role.CUSTOMER),
  validate(createOrderSchema),
  paymentController.createOrder
);

router.post(
  '/verify',
  authenticate,
  authorize(Role.CUSTOMER),
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

router.get(
  '/:bookingId',
  authenticate,
  paymentController.getPaymentByBooking
);

// Webhook — no auth (Razorpay signature verified in service)
router.post('/webhook', paymentController.handleWebhook);

export default router;
