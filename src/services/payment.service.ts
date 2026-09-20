import crypto from 'crypto';
import razorpayInstance from '../config/razorpay';
import { env } from '../config/env';
import { supabase } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { PaymentStatus, BookingStatus } from '../utils/constants';
import notificationService from './notification.service';
import { VerifyPaymentInput } from '../types';

class PaymentService {
  /**
   * Create a Razorpay order for a booking.
   */
  async createOrder(bookingId: string, customerId: string) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.customer_id !== customerId) {
      throw ApiError.forbidden('You can only pay for your own bookings');
    }

    if (booking.payment_status === PaymentStatus.SUCCESS) {
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
        workerId: booking.worker_id,
      },
    };

    const order = await razorpayInstance.orders.create(options);

    // Check if payment record exists
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (existingPayment) {
      await supabase
        .from('payments')
        .update({
          razorpay_order_id: order.id,
          status: PaymentStatus.PENDING,
          amount: booking.amount,
        })
        .eq('id', existingPayment.id);
    } else {
      await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          customer_id: customerId,
          worker_id: booking.worker_id,
          amount: booking.amount,
          razorpay_order_id: order.id,
          status: PaymentStatus.PENDING,
        });
    }

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
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        status: PaymentStatus.SUCCESS,
        transaction_date: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .maybeSingle();

    if (error || !payment) {
      throw ApiError.notFound('Payment record not found');
    }

    // Update booking payment status
    await supabase
      .from('bookings')
      .update({ payment_status: PaymentStatus.SUCCESS })
      .eq('id', payment.booking_id);

    // Notify worker
    await notificationService.notifyPaymentSuccess(
      payment.worker_id,
      payment.amount
    );

    return payment;
  }

  /**
   * Get payment details by booking ID.
   */
  async getPaymentByBookingId(bookingId: string) {
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, customer:customers!customer_id(name, email), worker:workers!worker_id(name, email)')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (error || !payment) {
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
        await supabase
          .from('payments')
          .update({
            razorpay_payment_id: paymentEntity.id,
            status: PaymentStatus.SUCCESS,
            transaction_date: new Date().toISOString(),
          })
          .eq('razorpay_order_id', paymentEntity.order_id);

        // Update booking
        const { data: payment } = await supabase
          .from('payments')
          .select('booking_id')
          .eq('razorpay_order_id', paymentEntity.order_id)
          .maybeSingle();

        if (payment) {
          await supabase
            .from('bookings')
            .update({ payment_status: PaymentStatus.SUCCESS })
            .eq('id', payment.booking_id);
        }
        break;
      }

      case 'payment.failed': {
        await supabase
          .from('payments')
          .update({ status: PaymentStatus.FAILED })
          .eq('razorpay_order_id', paymentEntity.order_id);
        break;
      }
    }
  }
}

export default new PaymentService();
