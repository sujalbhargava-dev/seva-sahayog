import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { supabase } from '../config/database';
import { ApiError } from '../utils/ApiError';
import {
  VerificationStatus,
  BookingStatus,
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
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const role = (req.query.role as string)?.toLowerCase();
  const search = req.query.search as string;

  if (role === 'customer' || role === 'worker' || role === 'admin') {
    const table = role === 'admin' ? 'admins' : (role === 'worker' ? 'workers' : 'customers');
    let query = supabase.from(table).select('*', { count: 'exact' });
    
    if (search) {
      if (role === 'admin') {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      } else {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }
    }

    const { data: users, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new ApiError(500, `Failed to fetch ${table}`);

    const mappedUsers = (users || []).map(u => ({ ...u, role: role.toUpperCase() }));
    res.json(ApiResponse.paginated(mappedUsers, count || 0, page, limit));
    return;
  }

  // If no specific role requested, combine customers and workers (admin dashboard typically wants this)
  let custQuery = supabase.from('customers').select('*', { count: 'exact' });
  let workQuery = supabase.from('workers').select('*', { count: 'exact' });

  if (search) {
    const condition = `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`;
    custQuery = custQuery.or(condition);
    workQuery = workQuery.or(condition);
  }

  const [custRes, workRes] = await Promise.all([
    custQuery.order('created_at', { ascending: false }).range(0, limit),
    workQuery.order('created_at', { ascending: false }).range(0, limit)
  ]);

  if (custRes.error) throw new ApiError(500, 'Failed to fetch customers');
  if (workRes.error) throw new ApiError(500, 'Failed to fetch workers');

  let combined = [
    ...(custRes.data || []).map(u => ({ ...u, role: 'CUSTOMER' })),
    ...(workRes.data || []).map(u => ({ ...u, role: 'WORKER' }))
  ];

  combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const totalCount = (custRes.count || 0) + (workRes.count || 0);

  // Poor man's pagination for combined lists (suitable for basic admin panel)
  const paginatedCombined = combined.slice(from, to + 1);

  res.json(ApiResponse.paginated(paginatedCombined, totalCount, page, limit));
});

/**
 * PATCH /api/admin/users/:id
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { isActive } = req.body;
  let updatedUser = null;

  // Try updating in customers table
  const { data: customer } = await supabase.from('customers').update({ is_active: isActive }).eq('id', req.params.id).select().maybeSingle();
  if (customer) updatedUser = { ...customer, role: 'CUSTOMER' };
  else {
    // Try updating in workers table
    const { data: worker } = await supabase.from('workers').update({ is_active: isActive }).eq('id', req.params.id).select().maybeSingle();
    if (worker) updatedUser = { ...worker, role: 'WORKER' };
    else {
      // Try updating in admins table
      const { data: admin } = await supabase.from('admins').update({ is_active: isActive }).eq('id', req.params.id).select().maybeSingle();
      if (admin) updatedUser = { ...admin, role: 'ADMIN' };
    }
  }

  if (!updatedUser) throw ApiError.notFound('User not found in any role');

  res.json(
    new ApiResponse(200, req.t?.('admin.userUpdated') || 'User updated', updatedUser)
  );
});

/**
 * PATCH /api/admin/workers/verify/:id
 */
export const verifyWorker = asyncHandler(async (req: Request, res: Response) => {
  const { verificationStatus } = req.body;

  if (!Object.values(VerificationStatus).includes(verificationStatus)) {
    throw ApiError.badRequest('Invalid verification status');
  }

  const { data: worker, error } = await supabase
    .from('workers')
    .update({ verification_status: verificationStatus })
    .eq('id', req.params.id)
    .select()
    .maybeSingle();

  if (error || !worker) throw ApiError.notFound('Worker not found');

  // Notify worker
  await notificationService.notifyVerificationUpdate(
    worker.id,
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
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const status = (req.query.status as string) || VerificationStatus.PENDING;

    const { data: verifications, count, error } = await supabase
      .from('skill_verifications')
      .select('*, worker:workers!worker_id(name, email, phone), reviewer:admins!reviewed_by(name)', { count: 'exact' })
      .eq('verification_status', status)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new ApiError(500, 'Failed to fetch verifications');

    res.json(ApiResponse.paginated(verifications, count || 0, page, limit));
  }
);

/**
 * PATCH /api/admin/skill-verification/:id
 */
export const reviewSkillVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const { verificationStatus, reviewerComments } = req.body;

    const { data: verification, error } = await supabase
      .from('skill_verifications')
      .update({
        verification_status: verificationStatus,
        reviewed_by: req.user!.userId,
        reviewer_comments: reviewerComments || '',
      })
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error || !verification) throw ApiError.notFound('Verification not found');

    // If approved, update worker's overall verification status
    if (verificationStatus === VerificationStatus.APPROVED) {
      await supabase
        .from('workers')
        .update({ verification_status: VerificationStatus.APPROVED })
        .eq('id', verification.worker_id);
    }

    // Notify worker
    await notificationService.notifyVerificationUpdate(
      verification.worker_id,
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
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const status = req.query.status as string;

    let query = supabase
      .from('disputes')
      .select('*, booking:bookings!booking_id(*), resolved_by_admin:admins!resolved_by(name)', { count: 'exact' });

    if (status) query = query.eq('status', status);

    const { data: disputes, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new ApiError(500, 'Failed to fetch disputes');

    res.json(ApiResponse.paginated(disputes, count || 0, page, limit));
  }
);

/**
 * PATCH /api/admin/disputes/:id/resolve
 */
export const resolveAdminDispute = asyncHandler(
  async (req: Request, res: Response) => {
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

    if (error || !dispute) throw ApiError.notFound('Dispute not found');

    await notificationService.notifyDisputeResolved(dispute.raised_by);

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
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const status = req.query.status as string;

    let query = supabase
      .from('bookings')
      .select('*, customer:customers!customer_id(name, email, phone), worker:workers!worker_id(name, email, phone), service:services!service_id(name, category)', { count: 'exact' });

    if (status) query = query.eq('status', status);

    const { data: bookings, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new ApiError(500, 'Failed to fetch bookings');

    res.json(ApiResponse.paginated(bookings, count || 0, page, limit));
  }
);

/**
 * GET /api/admin/payouts
 */
export const getPayouts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const payoutStatus = req.query.status as string;

  let query = supabase
    .from('worker_earnings')
    .select('*, worker:workers!worker_id(name, email, phone), booking:bookings!booking_id(scheduled_date, amount)', { count: 'exact' });

  if (payoutStatus) query = query.eq('payout_status', payoutStatus);

  const { data: earnings, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new ApiError(500, 'Failed to fetch payouts');

  res.json(ApiResponse.paginated(earnings, count || 0, page, limit));
});

/**
 * GET /api/admin/stats
 */
export const getPlatformStats = asyncHandler(
  async (req: Request, res: Response) => {
    const getCount = async (table: string, filter?: { col: string; val: any }) => {
      let q = supabase.from(table).select('*', { count: 'exact', head: true });
      if (filter) q = q.eq(filter.col, filter.val);
      const { count } = await q;
      return count || 0;
    };

    const [
      totalUsers,
      totalCustomers,
      totalWorkers,
      totalBookings,
      completedBookings,
      pendingBookings,
      openDisputes,
      verifiedWorkers,
      pendingVerifications,
    ] = await Promise.all([
      (async () => { const c = await getCount('customers'); const w = await getCount('workers'); const a = await getCount('admins'); return c + w + a; })(),
      getCount('customers'),
      getCount('workers'),
      getCount('bookings'),
      getCount('bookings', { col: 'status', val: BookingStatus.COMPLETED }),
      getCount('bookings', { col: 'status', val: BookingStatus.PENDING }),
      getCount('disputes', { col: 'status', val: DisputeStatus.OPEN }),
      getCount('worker_profiles', { col: 'verification_status', val: VerificationStatus.APPROVED }),
      getCount('skill_verifications', { col: 'verification_status', val: VerificationStatus.PENDING }),
    ]);

    const { data: platformFees } = await supabase
      .from('worker_earnings')
      .select('platform_fee');
    const totalRevenue = (platformFees || []).reduce((sum, e) => sum + Number(e.platform_fee), 0);

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
        totalPlatformFees: totalRevenue,
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
