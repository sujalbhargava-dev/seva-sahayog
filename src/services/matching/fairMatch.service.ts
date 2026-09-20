import { supabase } from '../../config/database';
import { haversineDistance, distanceToScore } from '../../utils/geo';
import {
  DEFAULT_MATCH_WEIGHTS,
  BookingStatus,
  PLATFORM_DEFAULTS,
  VerificationStatus,
} from '../../utils/constants';
import { MatchWeights, WorkerMatchResult } from '../../types';

class FairMatchService {
  private weights: MatchWeights;

  constructor(weights?: Partial<MatchWeights>) {
    this.weights = { ...DEFAULT_MATCH_WEIGHTS, ...weights };
  }

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

    let filteredWorkers: any[] = [];

    if (latitude !== undefined && longitude !== undefined) {
      // Use PostGIS RPC
      const { data, error } = await supabase.rpc('find_nearby_workers', {
        lat: latitude,
        lng: longitude,
        radius_km: radius,
        min_rating: minRating,
        req_skills: requiredSkills.length > 0 ? requiredSkills : null
      });
      
      if (error) {
        console.error('RPC Error:', error);
        return [];
      }
      filteredWorkers = data || [];
      
      // Filter language if provided
      if (language) {
        filteredWorkers = filteredWorkers.filter((w: any) => w.language === language);
      }
    } else {
      // Fallback base query without geo filtering
      let query = supabase
        .from('workers')
        .select('*')
        .eq('availability', true)
        .eq('verification_status', VerificationStatus.APPROVED)
        .eq('is_active', true);

      if (minRating > 0) {
        query = query.gte('rating', minRating);
      }
      if (requiredSkills.length > 0) {
        query = query.contains('skills', requiredSkills);
      }

      const { data: candidates, error } = await query;
      if (error || !candidates) return [];
      
      filteredWorkers = candidates;
      if (language) {
        filteredWorkers = filteredWorkers.filter((w: any) => w.language === language);
      }
    }

    if (filteredWorkers.length === 0) return [];

    // Get recent job counts for workload scoring (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workerIds = filteredWorkers.map((w: any) => w.id);
    
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('worker_id')
      .in('worker_id', workerIds)
      .in('status', [BookingStatus.COMPLETED, BookingStatus.IN_PROGRESS, BookingStatus.CONFIRMED])
      .gte('created_at', thirtyDaysAgo.toISOString());

    const jobCountMap = new Map<string, number>();
    (recentBookings || []).forEach((b: any) => {
      jobCountMap.set(b.worker_id, (jobCountMap.get(b.worker_id) || 0) + 1);
    });

    const maxJobs = Math.max(...Array.from(jobCountMap.values()), 1);

    // Score each worker
    const scored: WorkerMatchResult[] = filteredWorkers.map((worker: any) => {
      
      // 1. Skill Score
      const skillScore = this.calculateSkillScore(worker.skills || [], requiredSkills);

      // 2. Distance Score
      let distance = worker.distance_meters ? worker.distance_meters / 1000 : 0; // Convert back to km for scoring logic if provided by RPC
      let dScore = 1;
      
      if (latitude !== undefined && longitude !== undefined) {
        if (worker.distance_meters !== undefined) {
          distance = worker.distance_meters / 1000;
          dScore = distanceToScore(distance, radius);
        } else if (worker.location) {
          // Fallback if RPC wasn't used for some reason but location string exists
          const match = worker.location.match(/POINT\(([^ ]+) ([^)]+)\)/);
          if (match) {
            const wLng = parseFloat(match[1]);
            const wLat = parseFloat(match[2]);
            distance = haversineDistance(latitude, longitude, wLat, wLng);
            dScore = distanceToScore(distance, radius);
          }
        }
      }

      // 3. Availability Score
      const availScore = worker.availability ? 1.0 : 0.0;

      // 4. Workload Score
      const recentJobs = jobCountMap.get(worker.id) || 0;
      const workloadScore = 1 - recentJobs / maxJobs;

      // 5. Rating Score
      const ratingScore = worker.rating / 5;

      const matchScore =
        skillScore * this.weights.skill +
        dScore * this.weights.distance +
        availScore * this.weights.availability +
        workloadScore * this.weights.workload +
        ratingScore * this.weights.rating;

      return {
        workerId: worker.id,
        workerName: worker.name,
        matchScore: Math.round(matchScore * 1000) / 1000,
        distance: Math.round(distance * 100) / 100,
        rating: worker.rating,
        totalJobs: worker.total_jobs,
        skills: worker.skills,
        availability: worker.availability,
        profileImage: worker.profile_image,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, limit);
  }

  private calculateSkillScore(workerSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 1.0;
    const normalizedWorker = workerSkills.map((s) => s.toLowerCase());
    const normalizedRequired = requiredSkills.map((s) => s.toLowerCase());
    const matchCount = normalizedRequired.filter((skill) =>
      normalizedWorker.includes(skill)
    ).length;
    return matchCount / normalizedRequired.length;
  }

  setWeights(weights: Partial<MatchWeights>) {
    this.weights = { ...this.weights, ...weights };
  }

  getWeights(): MatchWeights {
    return { ...this.weights };
  }
}

export default new FairMatchService();
