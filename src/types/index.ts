import { Role, BookingStatus, PaymentStatus, PayoutStatus, VerificationStatus, DisputeStatus, PolicyStatus } from '../utils/constants';

// ============================================
// Models
// ============================================
export interface IUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  password_hash: string;
  role: Role;
  language: string;
  profile_image: string;
  is_active: boolean;
  refresh_token?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Common
// ============================================
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

// ============================================
// Auth
// ============================================
export interface JwtPayload {
  userId: string;
  role: Role;
}

export interface RegisterInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: Role.CUSTOMER | Role.WORKER;
  language?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// Worker Search
// ============================================
export interface WorkerSearchParams {
  service?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  availability?: boolean;
  rating?: number;
  language?: string;
  page?: number;
  limit?: number;
}

// ============================================
// Fair Match
// ============================================
export interface MatchWeights {
  skill: number;
  distance: number;
  availability: number;
  workload: number;
  rating: number;
}

export interface WorkerMatchResult {
  workerId: string;
  workerName: string;
  matchScore: number;
  distance: number;
  rating: number;
  totalJobs: number;
  skills: string[];
  availability: boolean;
  profileImage?: string;
}

// ============================================
// Booking
// ============================================
export interface CreateBookingInput {
  workerId: string;
  serviceId: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  amount: number;
}

// ============================================
// Payment
// ============================================
export interface CreateOrderInput {
  bookingId: string;
  amount: number;
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
