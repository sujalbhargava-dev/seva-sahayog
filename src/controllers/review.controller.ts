import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import Review from '../models/Review.model';
import Booking from '../models/Booking.model';
import { ApiError } from '../utils/ApiError';
import { BookingStatus } from '../utils/constants';
import workerService from '../services/worker.service';
import notificationService from '../services/notification.service';

/**
 * POST /api/reviews
 */
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, rating, comment } = req.body;
  const customerId = req.user!.userId;

  // Validate booking exists and is completed
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.customerId.toString() !== customerId) {
    throw ApiError.forbidden('You can only review your own bookings');
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw ApiError.badRequest('You can only review completed bookings');
  }

  // Check if already reviewed
  const existingReview = await Review.findOne({ bookingId, customerId });
  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this booking');
  }

  const review = await Review.create({
    bookingId,
    customerId,
    workerId: booking.workerId,
    rating,
    comment: comment || '',
  });

  // Recalculate worker's average rating
  await workerService.recalculateRating(booking.workerId.toString());

  // Notify worker
  await notificationService.notifyReviewReceived(
    booking.workerId.toString(),
    rating
  );

  res.status(201).json(
    new ApiResponse(201, req.t?.('review.created') || 'Review submitted', review)
  );
});

/**
 * GET /api/reviews/worker/:workerId
 */
export const getWorkerReviews = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ workerId: req.params.workerId })
      .populate('customerId', 'name profileImage')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Review.countDocuments({ workerId: req.params.workerId }),
  ]);

  res.json(ApiResponse.paginated(reviews, total, page, limit));
});
