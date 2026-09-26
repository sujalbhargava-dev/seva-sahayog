import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { supabase } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { PolicyStatus, Role } from '../utils/constants';

/**
 * GET /api/policies
 */
export const getPolicies = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const status = req.query.status as string;

  let query = supabase
    .from('policy_votes')
    .select('*, created_by_user:workers!created_by(name)', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: policies, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new ApiError(500, 'Failed to fetch policies');
  }

  res.json(ApiResponse.paginated(policies, count || 0, page, limit));
});

/**
 * POST /api/policies
 */
export const createPolicy = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, options, startDate, endDate } = req.body;

  const { data: policy, error } = await supabase
    .from('policy_votes')
    .insert({
      title,
      description,
      options,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      created_by: req.user!.role === Role.ADMIN ? null : req.user!.userId,
      status: PolicyStatus.ACTIVE,
    })
    .select()
    .single();

  if (error || !policy) {
    throw new ApiError(500, 'Failed to create policy');
  }

  res.status(201).json(
    new ApiResponse(201, req.t?.('policy.created') || 'Policy vote created', policy)
  );
});

/**
 * GET /api/policies/:id
 */
export const getPolicyById = asyncHandler(async (req: Request, res: Response) => {
  const { data: policy, error } = await supabase
    .from('policy_votes')
    .select('*, created_by_user:workers!created_by(name)')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error || !policy) {
    throw ApiError.notFound('Policy not found');
  }

  // Get vote results
  const { data: votesData } = await supabase
    .from('votes')
    .select('selected_option')
    .eq('policy_id', policy.id);

  const votes = votesData || [];
  const totalVotes = votes.length;

  const voteCounts = votes.reduce((acc: any, curr: any) => {
    acc[curr.selected_option] = (acc[curr.selected_option] || 0) + 1;
    return acc;
  }, {});

  // Check if current user has voted
  let userVote = null;
  if (req.user) {
    const { data: existingVote } = await supabase
      .from('votes')
      .select('selected_option')
      .eq('policy_id', policy.id)
      .eq('worker_id', req.user.userId)
      .maybeSingle();
    userVote = existingVote;
  }

  const results = policy.options.map((option: string) => {
    const count = voteCounts[option] || 0;
    return {
      option,
      votes: count,
      percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
    };
  });

  res.json(
    ApiResponse.ok({
      policy,
      results,
      totalVotes,
      userVoted: !!userVote,
      userVote: userVote?.selected_option || null,
    })
  );
});

/**
 * POST /api/policies/:id/vote
 */
export const castVote = asyncHandler(async (req: Request, res: Response) => {
  const { selectedOption } = req.body;
  const workerId = req.user!.userId;

  const { data: policy } = await supabase
    .from('policy_votes')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (!policy) {
    throw ApiError.notFound('Policy not found');
  }

  // Check if voting is still active
  if (policy.status !== PolicyStatus.ACTIVE) {
    throw ApiError.badRequest('Voting has closed for this policy');
  }

  if (new Date() > new Date(policy.end_date)) {
    throw ApiError.badRequest('Voting period has ended');
  }

  // Validate option
  if (!policy.options.includes(selectedOption)) {
    throw ApiError.badRequest('Invalid option selected');
  }

  // Check if already voted (unique index will also prevent this)
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('policy_id', policy.id)
    .eq('worker_id', workerId)
    .maybeSingle();

  if (existingVote) {
    throw ApiError.conflict('You have already voted on this policy');
  }

  const { data: vote, error } = await supabase
    .from('votes')
    .insert({
      policy_id: policy.id,
      worker_id: workerId,
      selected_option: selectedOption,
    })
    .select()
    .single();

  if (error || !vote) {
    throw new ApiError(500, 'Failed to cast vote');
  }

  res.status(201).json(
    new ApiResponse(201, req.t?.('policy.voted') || 'Vote cast successfully', vote)
  );
});

/**
 * PATCH /api/policies/:id/close
 */
export const closePolicy = asyncHandler(async (req: Request, res: Response) => {
  const { data: policy, error } = await supabase
    .from('policy_votes')
    .update({ status: PolicyStatus.CLOSED, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .maybeSingle();

  if (error || !policy) {
    throw ApiError.notFound('Policy not found');
  }

  res.json(new ApiResponse(200, 'Policy voting closed', policy));
});
