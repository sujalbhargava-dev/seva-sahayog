import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import bookingService from '../services/booking.service';
import { BookingStatus, Role } from '../utils/constants';

/**
 * POST /api/bookings
 */
export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.createBooking(req.user!.userId, req.body);

  res.status(201).json(
    new ApiResponse(201, req.t?.('booking.created') || 'Booking created', booking)
  );
});

/**
 * GET /api/bookings
 */
export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as BookingStatus | undefined;

  const result = await bookingService.getBookings(
    req.user!.userId,
    req.user!.role,
    page,
    limit,
    status
  );

  res.json(
    ApiResponse.paginated(result.bookings, result.total, result.page, result.limit)
  );
});

/**
 * GET /api/bookings/:id
 */
export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.getBookingById(
    req.params.id,
    req.user!.userId,
    req.user!.role
  );

  res.json(ApiResponse.ok(booking));
});

/**
 * PATCH /api/bookings/:id/accept
 */
export const acceptBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.transitionStatus(
    req.params.id,
    req.user!.userId,
    req.user!.role,
    BookingStatus.CONFIRMED
  );

  res.json(
    new ApiResponse(200, req.t?.('booking.accepted') || 'Booking accepted', booking)
  );
});

/**
 * PATCH /api/bookings/:id/reject
 */
export const rejectBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.transitionStatus(
    req.params.id,
    req.user!.userId,
    req.user!.role,
    BookingStatus.REJECTED
  );

  res.json(
    new ApiResponse(200, req.t?.('booking.rejected') || 'Booking rejected', booking)
  );
});

/**
 * PATCH /api/bookings/:id/start
 */
export const startBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.transitionStatus(
    req.params.id,
    req.user!.userId,
    req.user!.role,
    BookingStatus.IN_PROGRESS
  );

  res.json(
    new ApiResponse(200, req.t?.('booking.started') || 'Job started', booking)
  );
});

/**
 * PATCH /api/bookings/:id/complete
 */
export const completeBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.transitionStatus(
    req.params.id,
    req.user!.userId,
    req.user!.role,
    BookingStatus.COMPLETED
  );

  res.json(
    new ApiResponse(200, req.t?.('booking.completed') || 'Job completed', booking)
  );
});

/**
 * PATCH /api/bookings/:id/cancel
 */
export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.transitionStatus(
    req.params.id,
    req.user!.userId,
    req.user!.role,
    BookingStatus.CANCELLED
  );

  res.json(
    new ApiResponse(200, req.t?.('booking.cancelled') || 'Booking cancelled', booking)
  );
});
