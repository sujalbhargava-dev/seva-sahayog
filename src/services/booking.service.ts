import mongoose from 'mongoose';
import Booking from '../models/Booking.model';
import Service from '../models/Service.model';
import User from '../models/User.model';
import WorkerProfile from '../models/WorkerProfile.model';
import WorkerEarning from '../models/WorkerEarning.model';
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
    const service = await Service.findById(input.serviceId);
    if (!service || !service.isActive) {
      throw ApiError.notFound('Service not found or inactive');
    }

    // Validate worker exists and is available
    const workerProfile = await WorkerProfile.findOne({
      userId: input.workerId,
    });
    if (!workerProfile) {
      throw ApiError.notFound('Worker not found');
    }
    if (!workerProfile.availability) {
      throw ApiError.badRequest('Worker is not currently available');
    }

    // Prevent double booking — check for overlapping bookings
    const existingBooking = await Booking.findOne({
      workerId: input.workerId,
      scheduledDate: new Date(input.scheduledDate),
      scheduledTime: input.scheduledTime,
      status: {
        $in: [
          BookingStatus.PENDING,
          BookingStatus.ACCEPTED,
          BookingStatus.IN_PROGRESS,
        ],
      },
    });

    if (existingBooking) {
      throw ApiError.conflict(
        'Worker already has a booking at this time'
      );
    }

    // Create booking
    const booking = await Booking.create({
      customerId,
      workerId: input.workerId,
      serviceId: input.serviceId,
      location: {
        type: 'Point',
        coordinates: [input.location.longitude, input.location.latitude],
        address: input.location.address,
      },
      scheduledDate: new Date(input.scheduledDate),
      scheduledTime: input.scheduledTime,
      amount: input.amount,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    // Notify worker
    const customer = await User.findById(customerId);
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
    const skip = (page - 1) * limit;
    const query: any = {};

    if (role === Role.CUSTOMER) {
      query.customerId = userId;
    } else if (role === Role.WORKER) {
      query.workerId = userId;
    }
    // ADMIN sees all bookings — no filter

    if (status) {
      query.status = status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('customerId', 'name phone email')
        .populate('workerId', 'name phone email')
        .populate('serviceId', 'name category basePrice')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Booking.countDocuments(query),
    ]);

    return { bookings, total, page, limit };
  }

  /**
   * Get booking by ID with ownership check.
   */
  async getBookingById(bookingId: string, userId: string, role: Role) {
    const booking = await Booking.findById(bookingId)
      .populate('customerId', 'name phone email profileImage')
      .populate('workerId', 'name phone email profileImage')
      .populate('serviceId', 'name category description basePrice');

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Ownership check (admin can see all)
    if (role !== Role.ADMIN) {
      const isOwner =
        booking.customerId._id.toString() === userId ||
        booking.workerId._id.toString() === userId;

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
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Validate status transition
    const allowedTransitions = BOOKING_STATUS_TRANSITIONS[booking.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw ApiError.badRequest(
        `Cannot transition from ${booking.status} to ${newStatus}`
      );
    }

    // Authorization checks
    this.validateTransitionAuth(booking, userId, role, newStatus);

    // Apply transition
    booking.status = newStatus;

    // Side effects
    if (newStatus === BookingStatus.COMPLETED) {
      // Increment worker's total jobs
      await WorkerProfile.findOneAndUpdate(
        { userId: booking.workerId },
        { $inc: { totalJobs: 1 } }
      );

      // Create earning record
      const feePercent = parseFloat(env.PLATFORM_FEE_PERCENT) / 100;
      const welfarePercent = parseFloat(env.WELFARE_CONTRIBUTION_PERCENT) / 100;
      const platformFee = booking.amount * feePercent;
      const welfareContribution = booking.amount * welfarePercent;

      await WorkerEarning.create({
        workerId: booking.workerId,
        bookingId: booking._id,
        grossAmount: booking.amount,
        platformFee,
        welfareContribution,
        netAmount: booking.amount - platformFee - welfareContribution,
        payoutStatus: PayoutStatus.PENDING,
      });

      // Notify customer
      await notificationService.notifyBookingCompleted(
        booking.customerId.toString()
      );
    }

    if (newStatus === BookingStatus.ACCEPTED) {
      const worker = await User.findById(booking.workerId);
      if (worker) {
        await notificationService.notifyBookingAccepted(
          booking.customerId.toString(),
          worker.name
        );
      }
    }

    if (newStatus === BookingStatus.REJECTED) {
      const worker = await User.findById(booking.workerId);
      if (worker) {
        await notificationService.notifyBookingRejected(
          booking.customerId.toString(),
          worker.name
        );
      }
    }

    await booking.save();
    return booking;
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
    const isCustomer = booking.customerId.toString() === userId;
    const isWorker = booking.workerId.toString() === userId;
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
