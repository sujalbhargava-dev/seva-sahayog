import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import PolicyVote from '../models/PolicyVote.model';
import Vote from '../models/Vote.model';
import { ApiError } from '../utils/ApiError';
import { PolicyStatus, Role } from '../utils/constants';

/**
 * GET /api/policies
 */
export const getPolicies = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status as string;

  const query: any = {};
  if (status) query.status = status;

  const [policies, total] = await Promise.all([
    PolicyVote.find(query)
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    PolicyVote.countDocuments(query),
  ]);

  res.json(ApiResponse.paginated(policies, total, page, limit));
});

/**
 * POST /api/policies
 */
export const createPolicy = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, options, startDate, endDate } = req.body;

  const policy = await PolicyVote.create({
    title,
    description,
    options,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    createdBy: req.user!.userId,
  });

  res.status(201).json(
    new ApiResponse(201, req.t?.('policy.created') || 'Policy vote created', policy)
  );
});

/**
 * GET /api/policies/:id
 */
export const getPolicyById = asyncHandler(async (req: Request, res: Response) => {
  const policy = await PolicyVote.findById(req.params.id).populate(
    'createdBy',
    'name'
  );

  if (!policy) {
    throw ApiError.notFound('Policy not found');
  }

  // Get vote results
  const votes = await Vote.aggregate([
    { $match: { policyId: policy._id } },
    {
      $group: {
        _id: '$selectedOption',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalVotes = await Vote.countDocuments({ policyId: policy._id });

  // Check if current user has voted
  let userVote = null;
  if (req.user) {
    userVote = await Vote.findOne({
      policyId: policy._id,
      workerId: req.user.userId,
    });
  }

  const results = policy.options.map((option) => {
    const voteData = votes.find((v) => v._id === option);
    return {
      option,
      votes: voteData?.count || 0,
      percentage: totalVotes > 0 ? Math.round(((voteData?.count || 0) / totalVotes) * 100) : 0,
    };
  });

  res.json(
    ApiResponse.ok({
      policy,
      results,
      totalVotes,
      userVoted: !!userVote,
      userVote: userVote?.selectedOption || null,
    })
  );
});

/**
 * POST /api/policies/:id/vote
 */
export const castVote = asyncHandler(async (req: Request, res: Response) => {
  const { selectedOption } = req.body;
  const workerId = req.user!.userId;

  const policy = await PolicyVote.findById(req.params.id);
  if (!policy) {
    throw ApiError.notFound('Policy not found');
  }

  // Check if voting is still active
  if (policy.status !== PolicyStatus.ACTIVE) {
    throw ApiError.badRequest('Voting has closed for this policy');
  }

  if (new Date() > new Date(policy.endDate)) {
    throw ApiError.badRequest('Voting period has ended');
  }

  // Validate option
  if (!policy.options.includes(selectedOption)) {
    throw ApiError.badRequest('Invalid option selected');
  }

  // Check if already voted (unique index will also prevent this)
  const existingVote = await Vote.findOne({
    policyId: policy._id,
    workerId,
  });

  if (existingVote) {
    throw ApiError.conflict('You have already voted on this policy');
  }

  const vote = await Vote.create({
    policyId: policy._id,
    workerId,
    selectedOption,
  });

  res.status(201).json(
    new ApiResponse(201, req.t?.('policy.voted') || 'Vote cast successfully', vote)
  );
});

/**
 * PATCH /api/policies/:id/close
 */
export const closePolicy = asyncHandler(async (req: Request, res: Response) => {
  const policy = await PolicyVote.findByIdAndUpdate(
    req.params.id,
    { status: PolicyStatus.CLOSED },
    { new: true }
  );

  if (!policy) {
    throw ApiError.notFound('Policy not found');
  }

  res.json(new ApiResponse(200, 'Policy voting closed', policy));
});
