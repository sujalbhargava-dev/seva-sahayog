import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import paymentService from '../services/payment.service';

/**
 * POST /api/payments/create-order
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  const order = await paymentService.createOrder(bookingId, req.user!.userId);

  res.status(201).json(
    new ApiResponse(201, req.t?.('payment.orderCreated') || 'Payment order created', order)
  );
});

/**
 * POST /api/payments/verify
 */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.verifyPayment(req.body);

  res.json(
    new ApiResponse(200, req.t?.('payment.verified') || 'Payment verified', payment)
  );
});

/**
 * GET /api/payments/:bookingId
 */
export const getPaymentByBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await paymentService.getPaymentByBookingId(
      req.params.bookingId
    );

    res.json(ApiResponse.ok(payment));
  }
);

/**
 * POST /api/payments/webhook
 * Razorpay webhook handler — signature verified in service layer.
 */
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;

  await paymentService.handleWebhook(req.body, signature);

  // Always respond 200 to webhooks
  res.json({ status: 'ok' });
});
