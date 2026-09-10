import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import User from '../models/User.model';
import WorkerProfile from '../models/WorkerProfile.model';
import Booking from '../models/Booking.model';
import Payment from '../models/Payment.model';
import Dispute from '../models/Dispute.model';
import SkillVerification from '../models/SkillVerification.model';
import WorkerEarning from '../models/WorkerEarning.model';
import { ApiError } from '../utils/ApiError';
import {
  VerificationStatus,
  BookingStatus,
  PaymentStatus,
  PayoutStatus,
  DisputeStatus,
  Role,
} from '../utils/constants';
import notificationService from '../services/notification.service';

/**
 * GET /api/admin/users
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const role = req.query.role as string;
  const search = req.query.search as string;

  const query: any = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  res.json(ApiResponse.paginated(users, total, page, limit));
});

/**
 * PATCH /api/admin/users/:id
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );

  if (!user) throw ApiError.notFound('User not found');

  res.json(
    new ApiResponse(200, req.t?.('admin.userUpdated') || 'User updated', user)
  );
});

/**
 * PATCH /api/admin/workers/verify/:id
 */
export const verifyWorker = asyncHandler(async (req: Request, res: Response) => {
  const { verificationStatus } = req.body;

  if (
    !Object.values(VerificationStatus).includes(verificationStatus)
  ) {
    throw ApiError.badRequest('Invalid verification status');
  }

  const worker = await WorkerProfile.findByIdAndUpdate(
    req.params.id,
    { verificationStatus },
    { new: true }
  );

  if (!worker) throw ApiError.notFound('Worker not found');

  // Notify worker
  await notificationService.notifyVerificationUpdate(
    worker.userId.toString(),
    verificationStatus
  );

  res.json(
    new ApiResponse(
      200,
      req.t?.('admin.workerVerified') || 'Worker verification updated',
      worker
    )
  );
});

/**
 * GET /api/admin/skill-verification
 */
export const getSkillVerifications = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = (req.query.status as string) || VerificationStatus.PENDING;

    const [verifications, total] = await Promise.all([
      SkillVerification.find({ verificationStatus: status })
        .populate('workerId', 'name email phone')
        .populate('reviewedBy', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      SkillVerification.countDocuments({ verificationStatus: status }),
    ]);

    res.json(ApiResponse.paginated(verifications, total, page, limit));
  }
);

/**
 * PATCH /api/admin/skill-verification/:id
 */
export const reviewSkillVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const { verificationStatus, reviewerComments } = req.body;

    const verification = await SkillVerification.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus,
        reviewedBy: req.user!.userId,
        reviewerComments: reviewerComments || '',
      },
      { new: true }
    );

    if (!verification) throw ApiError.notFound('Verification not found');

    // If approved, update worker's overall verification status
    if (verificationStatus === VerificationStatus.APPROVED) {
      await WorkerProfile.findOneAndUpdate(
        { userId: verification.workerId },
        { verificationStatus: VerificationStatus.APPROVED }
      );
    }

    // Notify worker
    await notificationService.notifyVerificationUpdate(
      verification.workerId.toString(),
      verificationStatus
    );

    res.json(
      new ApiResponse(
        200,
        req.t?.('admin.skillVerificationUpdated') || 'Verification updated',
        verification
      )
    );
  }
);

/**
 * GET /api/admin/disputes
 */
export const getAdminDisputes = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const query: any = {};
    if (status) query.status = status;

    const [disputes, total] = await Promise.all([
      Dispute.find(query)
        .populate('bookingId')
        .populate('raisedBy', 'name email role')
        .populate('resolvedBy', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Dispute.countDocuments(query),
    ]);

    res.json(ApiResponse.paginated(disputes, total, page, limit));
  }
);

/**
 * PATCH /api/admin/disputes/:id/resolve
 */
export const resolveAdminDispute = asyncHandler(
  async (req: Request, res: Response) => {
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

    if (!dispute) throw ApiError.notFound('Dispute not found');

    await notificationService.notifyDisputeResolved(
      dispute.raisedBy.toString()
    );

    res.json(
      new ApiResponse(200, 'Dispute resolved', dispute)
    );
  }
);

/**
 * GET /api/admin/bookings
 */
export const getAdminBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const query: any = {};
    if (status) query.status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('customerId', 'name email phone')
        .populate('workerId', 'name email phone')
        .populate('serviceId', 'name category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Booking.countDocuments(query),
    ]);

    res.json(ApiResponse.paginated(bookings, total, page, limit));
  }
);

/**
 * GET /api/admin/payouts
 */
export const getPayouts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const payoutStatus = req.query.status as string;

  const query: any = {};
  if (payoutStatus) query.payoutStatus = payoutStatus;

  const [earnings, total] = await Promise.all([
    WorkerEarning.find(query)
      .populate('workerId', 'name email phone')
      .populate('bookingId', 'scheduledDate amount')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    WorkerEarning.countDocuments(query),
  ]);

  res.json(ApiResponse.paginated(earnings, total, page, limit));
});

/**
 * GET /api/admin/stats
 */
export const getPlatformStats = asyncHandler(
  async (req: Request, res: Response) => {
    const [
      totalUsers,
      totalCustomers,
      totalWorkers,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalRevenue,
      openDisputes,
      verifiedWorkers,
      pendingVerifications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: Role.CUSTOMER }),
      User.countDocuments({ role: Role.WORKER }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: BookingStatus.COMPLETED }),
      Booking.countDocuments({ status: BookingStatus.PENDING }),
      WorkerEarning.aggregate([
        { $group: { _id: null, total: { $sum: '$platformFee' } } },
      ]),
      Dispute.countDocuments({ status: DisputeStatus.OPEN }),
      WorkerProfile.countDocuments({
        verificationStatus: VerificationStatus.APPROVED,
      }),
      SkillVerification.countDocuments({
        verificationStatus: VerificationStatus.PENDING,
      }),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        customers: totalCustomers,
        workers: totalWorkers,
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings,
      },
      revenue: {
        totalPlatformFees: totalRevenue[0]?.total || 0,
      },
      disputes: {
        open: openDisputes,
      },
      workers: {
        verified: verifiedWorkers,
        pendingVerifications,
      },
    };

    res.json(
      new ApiResponse(
        200,
        req.t?.('admin.statsFetched') || 'Platform statistics fetched',
        stats
      )
    );
  }
);
