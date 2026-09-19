import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { supabase } from '../config/database';
import { PLATFORM_DEFAULTS } from '../utils/constants';

/**
 * GET /api/services
 */
export const getServices = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || PLATFORM_DEFAULTS.PAGINATION_DEFAULT_LIMIT;
  const category = req.query.category as string;
  const search = req.query.search as string;
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('services')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    // Basic ilike search on name or description
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: services, count, error } = await query
    .order('name', { ascending: true })
    .range(from, to);

  if (error) {
    return res.status(500).json(new ApiResponse(500, 'Failed to fetch services'));
  }

  res.json(ApiResponse.paginated(services, count || 0, page, limit));
});

/**
 * GET /api/services/:id
 */
export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error || !service) {
    return res.status(404).json(
      new ApiResponse(404, req.t?.('service.notFound') || 'Service not found')
    );
  }

  res.json(ApiResponse.ok(service));
});
