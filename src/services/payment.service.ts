import crypto from 'crypto';
import razorpayInstance from '../config/razorpay';
import { env } from '../config/env';
import Payment from '../models/Payment.model';
import Booking from '../models/Booking.model';
import { ApiError } from '../utils/ApiError';
import { PaymentStatus, BookingStatus } from '../utils/constants';
import notificationService from './notification.service';
import { VerifyPaymentInput } from '../types';

class PaymentService {
  /**
   * Create a Razorpay order for a booking.
   */
  async createOrder(bookingId: string, customerId: string) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.customerId.toString() !== customerId) {
      throw ApiError.forbidden('You can only pay for your own bookings');
    }

    if (booking.paymentStatus === PaymentStatus.SUCCESS) {
      throw ApiError.badRequest('Payment already completed for this booking');
    }

    if (
      booking.status !== BookingStatus.COMPLETED &&
      booking.status !== BookingStatus.ACCEPTED
    ) {
      throw ApiError.badRequest('Booking must be accepted or completed to make payment');
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(booking.amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId: bookingId,
        customerId: customerId,
        workerId: booking.workerId.toString(),
      },
    };

    const order = await razorpayInstance.orders.create(options);

    // Create/update payment record
    await Payment.findOneAndUpdate(
      { bookingId },
      {
        bookingId,
        customerId,
        workerId: booking.workerId,
        amount: booking.amount,
        razorpayOrderId: order.id,
        status: PaymentStatus.PENDING,
      },
      { upsert: true, new: true }
    );

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: env.RAZORPAY_KEY_ID,
    };
  }

  /**
   * Verify Razorpay payment signature.
   * NEVER trust payment status from the frontend.
   */
  async verifyPayment(input: VerifyPaymentInput) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;

    // Generate expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // Compare signatures
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isValid) {
      throw ApiError.badRequest('Invalid payment signature');
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        status: PaymentStatus.SUCCESS,
        transactionDate: new Date(),
      },
      { new: true }
    );

    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    // Update booking payment status
    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: PaymentStatus.SUCCESS,
    });

    // Notify worker
    await notificationService.notifyPaymentSuccess(
      payment.workerId.toString(),
      payment.amount
    );

    return payment;
  }

  /**
   * Get payment details by booking ID.
   */
  async getPaymentByBookingId(bookingId: string) {
    const payment = await Payment.findOne({ bookingId })
      .populate('customerId', 'name email')
      .populate('workerId', 'name email');

    if (!payment) {
      throw ApiError.notFound('Payment not found');
    }

    return payment;
  }

  /**
   * Handle Razorpay webhook event.
   * Webhook verification uses a separate secret.
   */
  async handleWebhook(body: any, signature: string) {
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );

    if (!isValid) {
      throw ApiError.badRequest('Invalid webhook signature');
    }

    const event = body.event;
    const paymentEntity = body.payload?.payment?.entity;

    if (!paymentEntity) return;

    switch (event) {
      case 'payment.captured': {
        await Payment.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          {
            razorpayPaymentId: paymentEntity.id,
            status: PaymentStatus.SUCCESS,
            transactionDate: new Date(),
          }
        );

        // Update booking
        const payment = await Payment.findOne({
          razorpayOrderId: paymentEntity.order_id,
        });
        if (payment) {
          await Booking.findByIdAndUpdate(payment.bookingId, {
            paymentStatus: PaymentStatus.SUCCESS,
          });
        }
        break;
      }

      case 'payment.failed': {
        await Payment.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          {
            status: PaymentStatus.FAILED,
          }
        );
        break;
      }
    }
  }
}

export default new PaymentService();
