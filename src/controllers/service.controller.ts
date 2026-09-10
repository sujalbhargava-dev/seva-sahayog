import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import Service from '../models/Service.model';
import { PLATFORM_DEFAULTS } from '../utils/constants';

/**
 * GET /api/services
 */
export const getServices = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || PLATFORM_DEFAULTS.PAGINATION_DEFAULT_LIMIT;
  const category = req.query.category as string;
  const search = req.query.search as string;
  const skip = (page - 1) * limit;

  const query: any = { isActive: true };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const [services, total] = await Promise.all([
    Service.find(query).skip(skip).limit(limit).sort({ name: 1 }),
    Service.countDocuments(query),
  ]);

  res.json(ApiResponse.paginated(services, total, page, limit));
});

/**
 * GET /api/services/:id
 */
export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json(
      new ApiResponse(404, req.t?.('service.notFound') || 'Service not found')
    );
  }

  res.json(ApiResponse.ok(service));
});
