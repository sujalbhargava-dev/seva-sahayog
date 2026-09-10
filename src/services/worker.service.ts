import WorkerProfile, { IWorkerProfile } from '../models/WorkerProfile.model';
import User from '../models/User.model';
import Booking from '../models/Booking.model';
import Review from '../models/Review.model';
import WorkerEarning from '../models/WorkerEarning.model';
import SkillVerification from '../models/SkillVerification.model';
import { ApiError } from '../utils/ApiError';
import { BookingStatus } from '../utils/constants';
import { PLATFORM_DEFAULTS } from '../utils/constants';

class WorkerService {
  /**
   * Get all workers (paginated).
   */
  async getWorkers(
    page: number = 1,
    limit: number = PLATFORM_DEFAULTS.PAGINATION_DEFAULT_LIMIT
  ) {
    const skip = (page - 1) * limit;
    const [workers, total] = await Promise.all([
      WorkerProfile.find()
        .populate('userId', 'name phone email profileImage language')
        .skip(skip)
        .limit(limit)
        .sort({ rating: -1 }),
      WorkerProfile.countDocuments(),
    ]);

    return { workers, total, page, limit };
  }

  /**
   * Get worker profile by ID.
   */
  async getWorkerById(workerId: string) {
    const worker = await WorkerProfile.findById(workerId).populate(
      'userId',
      'name phone email profileImage language'
    );

    if (!worker) {
      throw ApiError.notFound('Worker not found');
    }

    return worker;
  }

  /**
   * Get worker profile by user ID.
   */
  async getWorkerByUserId(userId: string) {
    const worker = await WorkerProfile.findOne({ userId }).populate(
      'userId',
      'name phone email profileImage language'
    );

    if (!worker) {
      throw ApiError.notFound('Worker profile not found');
    }

    return worker;
  }

  /**
   * Update worker profile.
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<IWorkerProfile, 'experience' | 'cooperativeMember'>>
  ) {
    const worker = await WorkerProfile.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!worker) {
      throw ApiError.notFound('Worker profile not found');
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
    const worker = await WorkerProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          'location.type': 'Point',
          'location.coordinates': [longitude, latitude], // GeoJSON: [lng, lat]
          'location.address': address,
        },
      },
      { new: true }
    );

    if (!worker) {
      throw ApiError.notFound('Worker profile not found');
    }

    return worker;
  }

  /**
   * Toggle worker availability.
   */
  async updateAvailability(userId: string, availability: boolean) {
    const worker = await WorkerProfile.findOneAndUpdate(
      { userId },
      { $set: { availability } },
      { new: true }
    );

    if (!worker) {
      throw ApiError.notFound('Worker profile not found');
    }

    return worker;
  }

  /**
   * Add skills to worker profile.
   */
  async addSkills(userId: string, skills: string[]) {
    const worker = await WorkerProfile.findOneAndUpdate(
      { userId },
      { $addToSet: { skills: { $each: skills } } },
      { new: true }
    );

    if (!worker) {
      throw ApiError.notFound('Worker profile not found');
    }

    return worker;
  }

  /**
   * Remove a skill from worker profile.
   */
  async removeSkill(userId: string, skill: string) {
    const worker = await WorkerProfile.findOneAndUpdate(
      { userId },
      { $pull: { skills: skill } },
      { new: true }
    );

    if (!worker) {
      throw ApiError.notFound('Worker profile not found');
    }

    return worker;
  }

  /**
   * Get worker's assigned bookings.
   */
  async getWorkerJobs(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const [jobs, total] = await Promise.all([
      Booking.find({ workerId: userId })
        .populate('customerId', 'name phone')
        .populate('serviceId', 'name category')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Booking.countDocuments({ workerId: userId }),
    ]);

    return { jobs, total, page, limit };
  }

  /**
   * Get worker's earnings summary.
   */
  async getWorkerEarnings(userId: string) {
    const earnings = await WorkerEarning.find({ workerId: userId })
      .populate('bookingId', 'scheduledDate serviceId')
      .sort({ createdAt: -1 });

    const totalEarnings = earnings.reduce((sum, e) => sum + e.netAmount, 0);
    const totalGross = earnings.reduce((sum, e) => sum + e.grossAmount, 0);
    const totalFees = earnings.reduce((sum, e) => sum + e.platformFee, 0);
    const totalWelfare = earnings.reduce(
      (sum, e) => sum + e.welfareContribution,
      0
    );

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
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find({ workerId: userId })
        .populate('customerId', 'name profileImage')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Review.countDocuments({ workerId: userId }),
    ]);

    return { reviews, total, page, limit };
  }

  /**
   * Upload verification video (saves to Cloudinary, creates SkillVerification record).
   */
  async uploadVerificationVideo(
    userId: string,
    videoUrl: string,
    skills: string[]
  ) {
    const worker = await WorkerProfile.findOne({ userId });
    if (!worker) {
      throw ApiError.notFound('Worker profile not found');
    }

    const verification = await SkillVerification.create({
      workerId: userId,
      videoUrl,
      skills,
    });

    // Update worker profile with latest video URL
    await WorkerProfile.findOneAndUpdate(
      { userId },
      { $set: { verificationVideoUrl: videoUrl } }
    );

    return verification;
  }

  /**
   * Get verification status for a worker.
   */
  async getVerificationStatus(userId: string) {
    const verifications = await SkillVerification.find({ workerId: userId }).sort({
      createdAt: -1,
    });

    const worker = await WorkerProfile.findOne({ userId });

    return {
      overallStatus: worker?.verificationStatus,
      verifications,
    };
  }

  /**
   * Recalculate worker's average rating.
   */
  async recalculateRating(workerId: string) {
    const result = await Review.aggregate([
      { $match: { workerId: workerId } },
      {
        $group: {
          _id: '$workerId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      await WorkerProfile.findOneAndUpdate(
        { userId: workerId },
        {
          $set: {
            rating: Math.round(result[0].avgRating * 10) / 10, // 1 decimal
          },
        }
      );
    }
  }
}

export default new WorkerService();
