import WorkerProfile from '../../models/WorkerProfile.model';
import Booking from '../../models/Booking.model';
import User from '../../models/User.model';
import { haversineDistance, distanceToScore } from '../../utils/geo';
import {
  DEFAULT_MATCH_WEIGHTS,
  BookingStatus,
  PLATFORM_DEFAULTS,
  VerificationStatus,
} from '../../utils/constants';
import { MatchWeights, WorkerMatchResult } from '../../types';

/**
 * Fair Match Engine
 *
 * Calculates a composite score for each worker based on:
 * - Skill match (35%)
 * - Distance (20%)
 * - Availability (20%)
 * - Workload balance (15%) — penalizes overworked workers
 * - Rating (10%)
 *
 * IMPORTANT: This engine intentionally does NOT always pick the
 * highest-rated worker. The workload factor ensures fair distribution
 * of jobs across workers to prevent monopolization.
 */
class FairMatchService {
  private weights: MatchWeights;

  constructor(weights?: Partial<MatchWeights>) {
    this.weights = { ...DEFAULT_MATCH_WEIGHTS, ...weights };
  }

  /**
   * Find and rank workers using the fair matching algorithm.
   */
  async findMatches(params: {
    service?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    requiredSkills?: string[];
    language?: string;
    minRating?: number;
    limit?: number;
  }): Promise<WorkerMatchResult[]> {
    const {
      latitude,
      longitude,
      radius = PLATFORM_DEFAULTS.SEARCH_RADIUS_KM,
      requiredSkills = [],
      language,
      minRating = 0,
      limit = 20,
    } = params;

    // Build base query
    const query: any = {
      availability: true,
      verificationStatus: VerificationStatus.APPROVED,
    };

    // Geo query if coordinates provided
    if (latitude !== undefined && longitude !== undefined) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude], // GeoJSON: [lng, lat]
          },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      };
    }

    // Skill filter
    if (requiredSkills.length > 0) {
      query.skills = { $in: requiredSkills };
    }

    // Rating filter
    if (minRating > 0) {
      query.rating = { $gte: minRating };
    }

    // Fetch candidate workers
    const candidates = await WorkerProfile.find(query)
      .populate('userId', 'name phone profileImage language isActive')
      .limit(limit * 3); // Fetch more than needed for scoring

    // Filter inactive users
    const activeWorkers = candidates.filter(
      (w) => (w.userId as any)?.isActive !== false
    );

    // Filter by language if specified
    const filteredWorkers = language
      ? activeWorkers.filter((w) => (w.userId as any)?.language === language)
      : activeWorkers;

    // Get recent job counts for workload scoring (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workerIds = filteredWorkers.map((w) => w.userId);
    const recentJobCounts = await Booking.aggregate([
      {
        $match: {
          workerId: { $in: workerIds },
          status: {
            $in: [
              BookingStatus.COMPLETED,
              BookingStatus.IN_PROGRESS,
              BookingStatus.ACCEPTED,
            ],
          },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$workerId',
          count: { $sum: 1 },
        },
      },
    ]);

    const jobCountMap = new Map<string, number>();
    recentJobCounts.forEach((item) => {
      jobCountMap.set(item._id.toString(), item.count);
    });

    // Find max job count for normalization
    const maxJobs = Math.max(...Array.from(jobCountMap.values()), 1);

    // Score each worker
    const scored: WorkerMatchResult[] = filteredWorkers.map((worker) => {
      const userObj = worker.userId as any;
      const workerUserId = userObj._id.toString();

      // 1. Skill Score
      const skillScore = this.calculateSkillScore(
        worker.skills,
        requiredSkills
      );

      // 2. Distance Score
      let distance = 0;
      let dScore = 1; // Default: full score if no location specified
      if (latitude !== undefined && longitude !== undefined) {
        const [wLng, wLat] = worker.location.coordinates;
        distance = haversineDistance(latitude, longitude, wLat, wLng);
        dScore = distanceToScore(distance, radius);
      }

      // 3. Availability Score (binary, but already filtered)
      const availScore = worker.availability ? 1.0 : 0.0;

      // 4. Workload Score — LOWER workload = HIGHER score
      //    This is the key to fair distribution
      const recentJobs = jobCountMap.get(workerUserId) || 0;
      const workloadScore = 1 - recentJobs / maxJobs;

      // 5. Rating Score (normalized to 0-1)
      const ratingScore = worker.rating / 5;

      // Composite score
      const matchScore =
        skillScore * this.weights.skill +
        dScore * this.weights.distance +
        availScore * this.weights.availability +
        workloadScore * this.weights.workload +
        ratingScore * this.weights.rating;

      return {
        workerId: worker._id.toString(),
        workerName: userObj.name,
        matchScore: Math.round(matchScore * 1000) / 1000,
        distance: Math.round(distance * 100) / 100,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        skills: worker.skills,
        availability: worker.availability,
        profileImage: userObj.profileImage,
      };
    });

    // Sort by match score (descending)
    scored.sort((a, b) => b.matchScore - a.matchScore);

    return scored.slice(0, limit);
  }

  /**
   * Calculate skill match score.
   * Full match = 1.0, partial = fraction, no match = 0.0
   */
  private calculateSkillScore(
    workerSkills: string[],
    requiredSkills: string[]
  ): number {
    if (requiredSkills.length === 0) return 1.0; // No skill filter applied

    const normalizedWorker = workerSkills.map((s) => s.toLowerCase());
    const normalizedRequired = requiredSkills.map((s) => s.toLowerCase());

    const matchCount = normalizedRequired.filter((skill) =>
      normalizedWorker.includes(skill)
    ).length;

    return matchCount / normalizedRequired.length;
  }

  /**
   * Update match weights (e.g., from admin config).
   */
  setWeights(weights: Partial<MatchWeights>) {
    this.weights = { ...this.weights, ...weights };
  }

  /**
   * Get current weights.
   */
  getWeights(): MatchWeights {
    return { ...this.weights };
  }
}

export default new FairMatchService();
