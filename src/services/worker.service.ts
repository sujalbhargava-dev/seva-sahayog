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
      .from('workers')
      .select('*', { count: 'exact' })
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
      .from('workers')
      .select('*')
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
    return this.getWorkerById(userId);
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
      .from('workers')
      .update(payload)
      .eq('id', userId)
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
      .from('workers')
      .update({
        location: `SRID=4326;POINT(${longitude} ${latitude})`,
        address: address,
      })
      .eq('id', userId)
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
      .from('workers')
      .update({ availability })
      .eq('id', userId)
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
      .from('workers')
      .select('skills')
      .eq('id', userId)
      .maybeSingle();

    if (!current) throw ApiError.notFound('Worker profile not found');

    const updatedSkills = Array.from(new Set([...(current.skills || []), ...newSkills]));

    const { data: worker, error } = await supabase
      .from('workers')
      .update({ skills: updatedSkills })
      .eq('id', userId)
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
      .from('workers')
      .select('skills')
      .eq('id', userId)
      .maybeSingle();

    if (!current) throw ApiError.notFound('Worker profile not found');

    const updatedSkills = (current.skills || []).filter((s: string) => s !== skill);

    const { data: worker, error } = await supabase
      .from('workers')
      .update({ skills: updatedSkills })
      .eq('id', userId)
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
      .select('*, customer:customers!customer_id(name, phone), service:services!service_id(name, category)', { count: 'exact' })
      .eq('worker_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new ApiError(500, 'Failed to fetch worker jobs: ' + error.message);

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
      .select('*, customer:customers!customer_id(name, profile_image)', { count: 'exact' })
      .eq('worker_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new ApiError(500, 'Failed to fetch reviews: ' + error.message);

    return { reviews, total: count || 0, page, limit };
  }

  /**
   * Upload verification documents (creates SkillVerification record).
   */
  async uploadVerificationDocuments(
    userId: string,
    videoUrl: string,
    idProofUrl: string,
    certificateUrl: string,
    skills: string[]
  ) {
    const { data: worker } = await supabase
      .from('workers')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!worker) throw ApiError.notFound('Worker profile not found');

    const { data: verification, error } = await supabase
      .from('skill_verifications')
      .insert({
        worker_id: userId,
        video_url: videoUrl,
        id_proof_url: idProofUrl,
        certificate_url: certificateUrl,
        skills,
      })
      .select()
      .single();

    if (error || !verification) throw new ApiError(500, 'Failed to create verification record: ' + error?.message);

    // Update worker profile with latest video URL if provided
    if (videoUrl) {
      await supabase
        .from('workers')
        .update({ verification_video_url: videoUrl })
        .eq('id', userId);
    }

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
      .from('workers')
      .select('verification_status')
      .eq('id', userId)
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
        .from('workers')
        .update({ rating: avgRating })
        .eq('id', workerId);
    }
  }
}

export default new WorkerService();
