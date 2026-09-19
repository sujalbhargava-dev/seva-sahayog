import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { supabase } from '../config/database';
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
  const { data: booking } = await supabase
    .from('bookings')
    .select('customer_id, worker_id, status')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.customer_id !== customerId) {
    throw ApiError.forbidden('You can only review your own bookings');
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw ApiError.badRequest('You can only review completed bookings');
  }

  // Check if already reviewed
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('customer_id', customerId)
    .maybeSingle();

  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this booking');
  }

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      booking_id: bookingId,
      customer_id: customerId,
      worker_id: booking.worker_id,
      rating,
      comment: comment || '',
    })
    .select()
    .single();

  if (error || !review) {
    throw new ApiError(500, 'Failed to submit review');
  }

  // Recalculate worker's average rating
  await workerService.recalculateRating(booking.worker_id);

  // Notify worker
  await notificationService.notifyReviewReceived(
    booking.worker_id,
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
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: reviews, count, error } = await supabase
    .from('reviews')
    .select('*, customer:users!customer_id(name, profile_image)', { count: 'exact' })
    .eq('worker_id', req.params.workerId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new ApiError(500, 'Failed to fetch reviews');
  }

  res.json(ApiResponse.paginated(reviews, count || 0, page, limit));
});
