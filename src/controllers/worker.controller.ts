import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import workerService from '../services/worker.service';
import { uploadToImageKit } from '../middleware/upload';

/**
 * GET /api/workers
 */
export const getWorkers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await workerService.getWorkers(page, limit);

  res.json(
    ApiResponse.paginated(result.workers, result.total, result.page, result.limit)
  );
});

/**
 * GET /api/workers/:id
 */
export const getWorkerById = asyncHandler(async (req: Request, res: Response) => {
  const worker = await workerService.getWorkerById(req.params.id);
  res.json(ApiResponse.ok(worker));
});

/**
 * PATCH /api/workers/profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const worker = await workerService.updateProfile(req.user!.userId, req.body);
  res.json(
    new ApiResponse(200, req.t?.('worker.profileUpdated') || 'Profile updated', worker)
  );
});

/**
 * PATCH /api/workers/location
 */
export const updateLocation = asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, address } = req.body;
  const worker = await workerService.updateLocation(
    req.user!.userId,
    latitude,
    longitude,
    address
  );
  res.json(
    new ApiResponse(200, req.t?.('worker.locationUpdated') || 'Location updated', worker)
  );
});

/**
 * PATCH /api/workers/availability
 */
export const updateAvailability = asyncHandler(async (req: Request, res: Response) => {
  const worker = await workerService.updateAvailability(
    req.user!.userId,
    req.body.availability
  );
  res.json(
    new ApiResponse(
      200,
      req.t?.('worker.availabilityUpdated') || 'Availability updated',
      worker
    )
  );
});

/**
 * POST /api/workers/skills
 */
export const addSkills = asyncHandler(async (req: Request, res: Response) => {
  const worker = await workerService.addSkills(req.user!.userId, req.body.skills);
  res.json(
    new ApiResponse(200, req.t?.('worker.skillAdded') || 'Skills added', worker)
  );
});

/**
 * DELETE /api/workers/skills/:skill
 */
export const removeSkill = asyncHandler(async (req: Request, res: Response) => {
  const worker = await workerService.removeSkill(
    req.user!.userId,
    req.params.skill
  );
  res.json(
    new ApiResponse(200, req.t?.('worker.skillRemoved') || 'Skill removed', worker)
  );
});

/**
 * GET /api/workers/jobs
 */
export const getWorkerJobs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await workerService.getWorkerJobs(req.user!.userId, page, limit);
  res.json(ApiResponse.paginated(result.jobs, result.total, result.page, result.limit));
});

/**
 * GET /api/workers/earnings
 */
export const getWorkerEarnings = asyncHandler(async (req: Request, res: Response) => {
  const result = await workerService.getWorkerEarnings(req.user!.userId);
  res.json(ApiResponse.ok(result));
});

/**
 * GET /api/workers/analytics
 */
export const getWorkerAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const worker = await workerService.getWorkerById(req.user!.userId);
  const earningsResult = await workerService.getWorkerEarnings(req.user!.userId);
  
  const analytics = {
    earnings: earningsResult.summary.totalEarnings || 0,
    chartData: [
      { day: 'Mon', value: 20, active: false },
      { day: 'Tue', value: 35, active: false },
      { day: 'Wed', value: 25, active: false },
      { day: 'Thu', value: 45, active: false },
      { day: 'Fri', value: 60, active: false },
      { day: 'Sat', value: 100, active: true },
      { day: 'Sun', value: 40, active: false },
    ],
    stats: {
      jobs: worker.total_jobs || 0,
      rating: worker.rating || 0,
      repeatCustomers: '62%',
      avgResponse: '8 min'
    },
    categories: [
      { name: 'Electrician', percentage: 45, color: '#fbbf24' },
      { name: 'Fan / Appliance', percentage: 30, color: '#60a5fa' },
      { name: 'Wiring', percentage: 25, color: '#ea580c' }
    ]
  };

  res.json(ApiResponse.ok(analytics));
});

/**
 * GET /api/workers/reviews
 */
export const getWorkerReviews = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await workerService.getWorkerReviews(req.user!.userId, page, limit);
  res.json(ApiResponse.paginated(result.reviews, result.total, result.page, result.limit));
});

/**
 * POST /api/workers/verification/documents
 */
export const uploadVerificationDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    let videoUrl = '';
    let idProofUrl = '';
    let certificateUrl = '';

    if (files && files.video && files.video[0]) {
      const { url } = await uploadToImageKit(files.video[0].buffer, 'verification-videos', 'video');
      videoUrl = url;
    }
    
    if (files && files.idProof && files.idProof[0]) {
      const { url } = await uploadToImageKit(files.idProof[0].buffer, 'verification-docs', 'image');
      idProofUrl = url;
    }

    if (files && files.certificate && files.certificate[0]) {
      const { url } = await uploadToImageKit(files.certificate[0].buffer, 'verification-docs', 'image');
      certificateUrl = url;
    }

    const skills = req.body.skills ? JSON.parse(req.body.skills) : [];

    const verification = await workerService.uploadVerificationDocuments(
      req.user!.userId,
      videoUrl,
      idProofUrl,
      certificateUrl,
      skills
    );

    res.status(201).json(
      new ApiResponse(
        201,
        req.t?.('worker.verificationUploaded') || 'Verification documents uploaded',
        verification
      )
    );
  }
);

/**
 * GET /api/workers/verification/status
 */
export const getVerificationStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const status = await workerService.getVerificationStatus(req.user!.userId);
    res.json(ApiResponse.ok(status));
  }
);
