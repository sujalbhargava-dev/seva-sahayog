import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import workerService from '../services/worker.service';
import { uploadToCloudinary } from '../middleware/upload';

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
 * GET /api/workers/reviews
 */
export const getWorkerReviews = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await workerService.getWorkerReviews(req.user!.userId, page, limit);
  res.json(ApiResponse.paginated(result.reviews, result.total, result.page, result.limit));
});

/**
 * POST /api/workers/verification/video
 */
export const uploadVerificationVideo = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json(new ApiResponse(400, 'Video file is required'));
    }

    // Upload to Cloudinary
    const { url } = await uploadToCloudinary(
      req.file.buffer,
      'verification-videos',
      'video'
    );

    const skills = req.body.skills
      ? JSON.parse(req.body.skills)
      : [];

    const verification = await workerService.uploadVerificationVideo(
      req.user!.userId,
      url,
      skills
    );

    res.status(201).json(
      new ApiResponse(
        201,
        req.t?.('worker.verificationUploaded') || 'Verification video uploaded',
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
