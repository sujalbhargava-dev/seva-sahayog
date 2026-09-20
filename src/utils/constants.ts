// ============================================
// User Roles
// ============================================
export enum Role {
  CUSTOMER = 'CUSTOMER',
  WORKER = 'WORKER',
  ADMIN = 'ADMIN',
}

// ============================================
// Booking Status
// ============================================
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

/**
 * Valid booking status transitions.
 * Maps current status → allowed next statuses.
 */
export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.REJECTED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  [BookingStatus.REJECTED]: [],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.DISPUTED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.DISPUTED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
};

// ============================================
// Payment Status
// ============================================
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// ============================================
// Payout Status
// ============================================
export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

// ============================================
// Verification Status
// ============================================
export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ============================================
// Dispute Status
// ============================================
export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// ============================================
// Policy Vote Status
// ============================================
export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

// ============================================
// Notification Types
// ============================================
export enum NotificationType {
  BOOKING_REQUEST = 'BOOKING_REQUEST',
  BOOKING_ACCEPTED = 'BOOKING_ACCEPTED',
  BOOKING_REJECTED = 'BOOKING_REJECTED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  DISPUTE_RAISED = 'DISPUTE_RAISED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  VERIFICATION_UPDATE = 'VERIFICATION_UPDATE',
  POLICY_VOTE = 'POLICY_VOTE',
  GENERAL = 'GENERAL',
}

// ============================================
// Supported Languages
// ============================================
export enum Language {
  EN = 'en',
  HI = 'hi',
}

// ============================================
// Fair Match Weights (defaults)
// ============================================
export const DEFAULT_MATCH_WEIGHTS = {
  skill: 0.35,
  distance: 0.20,
  availability: 0.20,
  workload: 0.15,
  rating: 0.10,
};

// ============================================
// Platform Config
// ============================================
export const PLATFORM_DEFAULTS = {
  SEARCH_RADIUS_KM: 25,
  MAX_SEARCH_RADIUS_KM: 100,
  PAGINATION_DEFAULT_LIMIT: 20,
  PAGINATION_MAX_LIMIT: 100,
  NOTIFICATION_TTL_DAYS: 30,
  EARTH_RADIUS_KM: 6371,
};
