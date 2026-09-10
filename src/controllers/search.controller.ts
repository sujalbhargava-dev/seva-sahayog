import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import fairMatchService from '../services/matching/fairMatch.service';

/**
 * GET /api/search/workers
 * Search workers using the fair matching engine.
 */
export const searchWorkers = asyncHandler(async (req: Request, res: Response) => {
  const {
    service,
    latitude,
    longitude,
    radius,
    availability,
    rating,
    language,
    page,
    limit,
  } = req.query as any;

  const results = await fairMatchService.findMatches({
    requiredSkills: service ? [service] : [],
    latitude: latitude ? parseFloat(latitude) : undefined,
    longitude: longitude ? parseFloat(longitude) : undefined,
    radius: radius ? parseFloat(radius) : undefined,
    language,
    minRating: rating ? parseFloat(rating) : undefined,
    limit: limit ? parseInt(limit) : 20,
  });

  res.json(
    new ApiResponse(
      200,
      results.length > 0
        ? req.t?.('search.results') || 'Search results fetched'
        : req.t?.('search.noResults') || 'No workers found',
      results,
      { count: results.length }
    )
  );
});
