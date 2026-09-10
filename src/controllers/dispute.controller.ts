import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import Dispute from '../models/Dispute.model';
import Booking from '../models/Booking.model';
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

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Only booking participants can raise dispute
  const isParticipant =
    booking.customerId.toString() === userId ||
    booking.workerId.toString() === userId;

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

  const dispute = await Dispute.create({
    bookingId,
    raisedBy: userId,
    reason,
    description,
    evidence: req.body.evidence || [],
  });

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
    booking.customerId.toString() === userId
      ? booking.workerId.toString()
      : booking.customerId.toString();

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
  const skip = (page - 1) * limit;

  const query: any = {};
  if (req.user!.role !== Role.ADMIN) {
    query.raisedBy = req.user!.userId;
  }

  const status = req.query.status as string;
  if (status) {
    query.status = status;
  }

  const [disputes, total] = await Promise.all([
    Dispute.find(query)
      .populate('bookingId', 'status amount scheduledDate')
      .populate('raisedBy', 'name email')
      .populate('resolvedBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Dispute.countDocuments(query),
  ]);

  res.json(ApiResponse.paginated(disputes, total, page, limit));
});

/**
 * PATCH /api/disputes/:id/resolve (Admin only)
 */
export const resolveDispute = asyncHandler(async (req: Request, res: Response) => {
  const { resolution } = req.body;

  const dispute = await Dispute.findByIdAndUpdate(
    req.params.id,
    {
      status: DisputeStatus.RESOLVED,
      resolution,
      resolvedBy: req.user!.userId,
    },
    { new: true }
  );

  if (!dispute) {
    throw ApiError.notFound('Dispute not found');
  }

  // Notify the person who raised the dispute
  await notificationService.notifyDisputeResolved(dispute.raisedBy.toString());

  res.json(
    new ApiResponse(200, req.t?.('dispute.resolved') || 'Dispute resolved', dispute)
  );
});
