import { supabase } from '../config/database';
import { ApiError } from '../utils/ApiError';
import {
  BookingStatus,
  PaymentStatus,
  PayoutStatus,
  BOOKING_STATUS_TRANSITIONS,
  Role,
} from '../utils/constants';
import { env } from '../config/env';
import notificationService from './notification.service';
import { CreateBookingInput } from '../types';

class BookingService {
  /**
   * Create a new booking.
   */
  async createBooking(customerId: string, input: CreateBookingInput) {
    // Validate service exists
    const { data: service } = await supabase
      .from('services')
      .select('id, is_active')
      .eq('id', input.serviceId)
      .maybeSingle();

    if (!service || !service.is_active) {
      throw ApiError.notFound('Service not found or inactive');
    }

    // Validate worker exists and is available
    const { data: workerProfile } = await supabase
      .from('worker_profiles')
      .select('id, availability')
      .eq('user_id', input.workerId)
      .maybeSingle();

    if (!workerProfile) {
      throw ApiError.notFound('Worker not found');
    }
    if (!workerProfile.availability) {
      throw ApiError.badRequest('Worker is not currently available');
    }

    // Prevent double booking — check for overlapping bookings
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('worker_id', input.workerId)
      .eq('scheduled_date', input.scheduledDate)
      .eq('scheduled_time', input.scheduledTime)
      .in('status', [
        BookingStatus.PENDING,
        BookingStatus.ACCEPTED,
        BookingStatus.IN_PROGRESS,
      ])
      .maybeSingle();

    if (existingBooking) {
      throw ApiError.conflict('Worker already has a booking at this time');
    }

    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        worker_id: input.workerId,
        service_id: input.serviceId,
        location: `SRID=4326;POINT(${input.location.longitude} ${input.location.latitude})`,
        address: input.location.address,
        scheduled_date: input.scheduledDate,
        scheduled_time: input.scheduledTime,
        amount: input.amount,
        status: BookingStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
      })
      .select()
      .single();

    if (error || !booking) {
      throw new ApiError(500, 'Failed to create booking: ' + error?.message);
    }

    // Notify worker
    const { data: customer } = await supabase
      .from('users')
      .select('name')
      .eq('id', customerId)
      .maybeSingle();

    if (customer) {
      await notificationService.notifyBookingRequest(
        input.workerId,
        customer.name
      );
    }

    return booking;
  }

  /**
   * Get bookings for a user (filtered by role).
   */
  async getBookings(
    userId: string,
    role: Role,
    page: number = 1,
    limit: number = 20,
    status?: BookingStatus
  ) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('bookings')
      .select(`
        *,
        customer:users!customer_id(name, phone, email),
        worker:users!worker_id(name, phone, email),
        service:services!service_id(name, category, base_price)
      `, { count: 'exact' });

    if (role === Role.CUSTOMER) {
      query = query.eq('customer_id', userId);
    } else if (role === Role.WORKER) {
      query = query.eq('worker_id', userId);
    }
    // ADMIN sees all bookings — no filter

    if (status) {
      query = query.eq('status', status);
    }

    const { data: bookings, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new ApiError(500, 'Failed to fetch bookings: ' + error.message);
    }

    return { bookings, total: count || 0, page, limit };
  }

  /**
   * Get booking by ID with ownership check.
   */
  async getBookingById(bookingId: string, userId: string, role: Role) {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:users!customer_id(id, name, phone, email, profile_image),
        worker:users!worker_id(id, name, phone, email, profile_image),
        service:services!service_id(id, name, category, description, base_price)
      `)
      .eq('id', bookingId)
      .maybeSingle();

    if (error || !booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Ownership check (admin can see all)
    if (role !== Role.ADMIN) {
      const isOwner =
        booking.customer.id === userId ||
        booking.worker.id === userId;

      if (!isOwner) {
        throw ApiError.forbidden('You are not authorized to view this booking');
      }
    }

    return booking;
  }

  /**
   * Transition booking status with validation.
   */
  async transitionStatus(
    bookingId: string,
    userId: string,
    role: Role,
    newStatus: BookingStatus
  ) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, status, customer_id, worker_id, amount')
      .eq('id', bookingId)
      .maybeSingle();

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Validate status transition
    const allowedTransitions = BOOKING_STATUS_TRANSITIONS[booking.status as BookingStatus];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw ApiError.badRequest(
        `Cannot transition from ${booking.status} to ${newStatus}`
      );
    }

    // Authorization checks
    this.validateTransitionAuth(booking, userId, role, newStatus);

    // Apply transition
    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();

    if (error || !updatedBooking) {
      throw new ApiError(500, 'Failed to update booking status');
    }

    // Side effects
    if (newStatus === BookingStatus.COMPLETED) {
      // Increment worker's total jobs
      const { data: workerProfile } = await supabase
        .from('worker_profiles')
        .select('total_jobs')
        .eq('user_id', booking.worker_id)
        .maybeSingle();

      if (workerProfile) {
        await supabase
          .from('worker_profiles')
          .update({ total_jobs: workerProfile.total_jobs + 1 })
          .eq('user_id', booking.worker_id);
      }

      // Create earning record
      const feePercent = parseFloat(env.PLATFORM_FEE_PERCENT) / 100;
      const welfarePercent = parseFloat(env.WELFARE_CONTRIBUTION_PERCENT) / 100;
      const platformFee = booking.amount * feePercent;
      const welfareContribution = booking.amount * welfarePercent;

      await supabase.from('worker_earnings').insert({
        worker_id: booking.worker_id,
        booking_id: booking.id,
        gross_amount: booking.amount,
        platform_fee: platformFee,
        welfare_contribution: welfareContribution,
        net_amount: booking.amount - platformFee - welfareContribution,
        payout_status: PayoutStatus.PENDING,
      });

      // Notify customer
      await notificationService.notifyBookingCompleted(booking.customer_id);
    }

    if (newStatus === BookingStatus.ACCEPTED) {
      const { data: worker } = await supabase
        .from('users')
        .select('name')
        .eq('id', booking.worker_id)
        .maybeSingle();

      if (worker) {
        await notificationService.notifyBookingAccepted(
          booking.customer_id,
          worker.name
        );
      }
    }

    if (newStatus === BookingStatus.REJECTED) {
      const { data: worker } = await supabase
        .from('users')
        .select('name')
        .eq('id', booking.worker_id)
        .maybeSingle();

      if (worker) {
        await notificationService.notifyBookingRejected(
          booking.customer_id,
          worker.name
        );
      }
    }

    return updatedBooking;
  }

  /**
   * Validate that the user is authorized to make this status transition.
   */
  private validateTransitionAuth(
    booking: any,
    userId: string,
    role: Role,
    newStatus: BookingStatus
  ) {
    const isCustomer = booking.customer_id === userId;
    const isWorker = booking.worker_id === userId;
    const isAdmin = role === Role.ADMIN;

    switch (newStatus) {
      case BookingStatus.ACCEPTED:
      case BookingStatus.REJECTED:
      case BookingStatus.IN_PROGRESS:
      case BookingStatus.COMPLETED:
        if (!isWorker && !isAdmin) {
          throw ApiError.forbidden('Only the assigned worker can perform this action');
        }
        break;

      case BookingStatus.CANCELLED:
        if (!isCustomer && !isWorker && !isAdmin) {
          throw ApiError.forbidden('You are not authorized to cancel this booking');
        }
        break;

      case BookingStatus.DISPUTED:
        if (!isCustomer && !isWorker) {
          throw ApiError.forbidden('Only booking participants can raise a dispute');
        }
        break;

      default:
        throw ApiError.badRequest('Invalid status transition');
    }
  }
}

export default new BookingService();
