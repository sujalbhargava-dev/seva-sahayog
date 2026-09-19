import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { supabase } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { DisputeStatus, BookingStatus, Role } from '../utils/constants';
import notificationService from '../services/notification.service';
import bookingService from '../services/booking.service';

/**
 * POST /api/disputes
 */
export const raiseDispute = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, reason, description } = req.body;
  const userId = req.user!.userId;

  const { data: booking } = await supabase
    .from('bookings')
    .select('customer_id, worker_id, status')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Only booking participants can raise dispute
  const isParticipant =
    booking.customer_id === userId ||
    booking.worker_id === userId;

  if (!isParticipant) {
    throw ApiError.forbidden('Only booking participants can raise a dispute');
  }

  // Can only dispute in-progress or completed bookings
  if (
    booking.status !== BookingStatus.IN_PROGRESS &&
    booking.status !== BookingStatus.COMPLETED
  ) {
    throw ApiError.badRequest('Can only dispute in-progress or completed bookings');
  }

  const { data: dispute, error } = await supabase
    .from('disputes')
    .insert({
      booking_id: bookingId,
      raised_by: userId,
      reason,
      description,
      evidence: req.body.evidence || [],
      status: DisputeStatus.OPEN,
    })
    .select()
    .single();

  if (error || !dispute) {
    throw new ApiError(500, 'Failed to create dispute');
  }

  // Update booking status to DISPUTED
  if (booking.status === BookingStatus.IN_PROGRESS) {
    await bookingService.transitionStatus(
      bookingId,
      userId,
      req.user!.role,
      BookingStatus.DISPUTED
    );
  }

  // Notify other party
  const otherParty =
    booking.customer_id === userId
      ? booking.worker_id
      : booking.customer_id;

  await notificationService.notifyDisputeRaised(otherParty);

  res.status(201).json(
    new ApiResponse(201, req.t?.('dispute.raised') || 'Dispute raised', dispute)
  );
});

/**
 * GET /api/disputes
 */
export const getDisputes = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('disputes')
    .select(`
      *,
      booking:bookings!booking_id(status, amount, scheduled_date),
      raised_by_user:users!raised_by(name, email),
      resolved_by_user:users!resolved_by(name)
    `, { count: 'exact' });

  if (req.user!.role !== Role.ADMIN) {
    query = query.eq('raised_by', req.user!.userId);
  }

  const status = req.query.status as string;
  if (status) {
    query = query.eq('status', status);
  }

  const { data: disputes, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new ApiError(500, 'Failed to fetch disputes');
  }

  res.json(ApiResponse.paginated(disputes, count || 0, page, limit));
});

/**
 * PATCH /api/disputes/:id/resolve (Admin only)
 */
export const resolveDispute = asyncHandler(async (req: Request, res: Response) => {
  const { resolution } = req.body;

  const { data: dispute, error } = await supabase
    .from('disputes')
    .update({
      status: DisputeStatus.RESOLVED,
      resolution,
      resolved_by: req.user!.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .maybeSingle();

  if (error || !dispute) {
    throw ApiError.notFound('Dispute not found');
  }

  // Notify the person who raised the dispute
  await notificationService.notifyDisputeResolved(dispute.raised_by);

  res.json(
    new ApiResponse(200, req.t?.('dispute.resolved') || 'Dispute resolved', dispute)
  );
});
