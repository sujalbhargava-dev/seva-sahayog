import { supabase } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { PLATFORM_DEFAULTS } from '../utils/constants';

class WorkerService {
  /**
   * Get all workers (paginated).
   */
  async getWorkers(
    page: number = 1,
    limit: number = PLATFORM_DEFAULTS.PAGINATION_DEFAULT_LIMIT
  ) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: workers, count, error } = await supabase
      .from('worker_profiles')
      .select('*, user:users!user_id(name, phone, email, profile_image, language)', { count: 'exact' })
      .order('rating', { ascending: false })
      .range(from, to);

    if (error) {
      throw new ApiError(500, 'Failed to fetch workers: ' + error.message);
    }

    return { workers, total: count || 0, page, limit };
  }

  /**
   * Get worker profile by ID.
   */
  async getWorkerById(workerId: string) {
    const { data: worker, error } = await supabase
      .from('worker_profiles')
      .select('*, user:users!user_id(name, phone, email, profile_image, language)')
      .eq('id', workerId)
      .maybeSingle();

    if (error || !worker) {
      throw ApiError.notFound('Worker not found');
    }

    return worker;
  }

  /**
   * Get worker profile by user ID.
   */
  async getWorkerByUserId(userId: string) {
    const { data: worker, error } = await supabase
      .from('worker_profiles')
      .select('*, user:users!user_id(name, phone, email, profile_image, language)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !worker) {
      throw ApiError.notFound('Worker profile not found');
    }

    return worker;
  }

  /**
   * Update worker profile.
   */
  async updateProfile(
    userId: string,
    updates: { experience?: number; cooperativeMember?: boolean }
  ) {
    const payload: any = {};
    if (updates.experience !== undefined) payload.experience = updates.experience;
    if (updates.cooperativeMember !== undefined) payload.cooperative_member = updates.cooperativeMember;

    const { data: worker, error } = await supabase
      .from('worker_profiles')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error || !worker) {
      throw ApiError.notFound('Worker profile not found or update failed');
    }

    return worker;
  }

  /**
   * Update worker GPS location.
   */
  async updateLocation(
    userId: string,
    latitude: number,
    longitude: number,
    address: string
  ) {
    const { data: worker, error } = await supabase
      .from('worker_profiles')
      .update({
        location: `SRID=4326;POINT(${longitude} ${latitude})`,
        address: address,
      })
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error || !worker) {
      throw ApiError.notFound('Worker profile not found or update failed');
    }

    return worker;
  }

  /**
   * Toggle worker availability.
   */
  async updateAvailability(userId: string, availability: boolean) {
    const { data: worker, error } = await supabase
      .from('worker_profiles')
      .update({ availability })
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error || !worker) {
      throw ApiError.notFound('Worker profile not found or update failed');
    }

    return worker;
  }

  /**
   * Add skills to worker profile.
   */
  async addSkills(userId: string, newSkills: string[]) {
    // Fetch current skills
    const { data: current } = await supabase
      .from('worker_profiles')
      .select('skills')
      .eq('user_id', userId)
      .maybeSingle();

    if (!current) throw ApiError.notFound('Worker profile not found');

    const updatedSkills = Array.from(new Set([...(current.skills || []), ...newSkills]));

    const { data: worker, error } = await supabase
      .from('worker_profiles')
      .update({ skills: updatedSkills })
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error || !worker) throw ApiError.notFound('Failed to update skills');
    return worker;
  }

  /**
   * Remove a skill from worker profile.
   */
  async removeSkill(userId: string, skill: string) {
    const { data: current } = await supabase
      .from('worker_profiles')
      .select('skills')
      .eq('user_id', userId)
      .maybeSingle();

    if (!current) throw ApiError.notFound('Worker profile not found');

    const updatedSkills = (current.skills || []).filter((s: string) => s !== skill);

    const { data: worker, error } = await supabase
      .from('worker_profiles')
      .update({ skills: updatedSkills })
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error || !worker) throw ApiError.notFound('Failed to remove skill');
    return worker;
  }

  /**
   * Get worker's assigned bookings.
   */
  async getWorkerJobs(userId: string, page: number = 1, limit: number = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: jobs, count, error } = await supabase
      .from('bookings')
      .select('*, customer:users!customer_id(name, phone), service:services!service_id(name, category)', { count: 'exact' })
      .eq('worker_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new ApiError(500, 'Failed to fetch worker jobs');

    return { jobs, total: count || 0, page, limit };
  }

  /**
   * Get worker's earnings summary.
   */
  async getWorkerEarnings(userId: string) {
    const { data: earnings, error } = await supabase
      .from('worker_earnings')
      .select('*, booking:bookings!booking_id(scheduled_date, service_id)')
      .eq('worker_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, 'Failed to fetch earnings');

    const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.net_amount), 0);
    const totalGross = earnings.reduce((sum, e) => sum + Number(e.gross_amount), 0);
    const totalFees = earnings.reduce((sum, e) => sum + Number(e.platform_fee), 0);
    const totalWelfare = earnings.reduce((sum, e) => sum + Number(e.welfare_contribution), 0);

    return {
      earnings,
      summary: {
        totalEarnings,
        totalGross,
        totalFees,
        totalWelfare,
        totalJobs: earnings.length,
      },
    };
  }

  /**
   * Get reviews for a worker.
   */
  async getWorkerReviews(userId: string, page: number = 1, limit: number = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: reviews, count, error } = await supabase
      .from('reviews')
      .select('*, customer:users!customer_id(name, profile_image)', { count: 'exact' })
      .eq('worker_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new ApiError(500, 'Failed to fetch reviews');

    return { reviews, total: count || 0, page, limit };
  }

  /**
   * Upload verification video (saves to Cloudinary, creates SkillVerification record).
   */
  async uploadVerificationVideo(
    userId: string,
    videoUrl: string,
    skills: string[]
  ) {
    const { data: worker } = await supabase
      .from('worker_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!worker) throw ApiError.notFound('Worker profile not found');

    const { data: verification, error } = await supabase
      .from('skill_verifications')
      .insert({
        worker_id: userId,
        video_url: videoUrl,
        skills,
      })
      .select()
      .single();

    if (error || !verification) throw new ApiError(500, 'Failed to create verification record');

    // Update worker profile with latest video URL
    await supabase
      .from('worker_profiles')
      .update({ verification_video_url: videoUrl })
      .eq('user_id', userId);

    return verification;
  }

  /**
   * Get verification status for a worker.
   */
  async getVerificationStatus(userId: string) {
    const { data: verifications } = await supabase
      .from('skill_verifications')
      .select('*')
      .eq('worker_id', userId)
      .order('created_at', { ascending: false });

    const { data: worker } = await supabase
      .from('worker_profiles')
      .select('verification_status')
      .eq('user_id', userId)
      .maybeSingle();

    return {
      overallStatus: worker?.verification_status,
      verifications,
    };
  }

  /**
   * Recalculate worker's average rating.
   */
  async recalculateRating(workerId: string) {
    // Fetch all reviews for this worker
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('worker_id', workerId);

    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;

      await supabase
        .from('worker_profiles')
        .update({ rating: avgRating })
        .eq('user_id', workerId);
    }
  }
}

export default new WorkerService();
