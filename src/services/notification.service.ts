import Notification from '../models/Notification.model';
import { NotificationType } from '../utils/constants';

class NotificationService {
  /**
   * Create a notification for a user.
   */
  async create(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.GENERAL
  ) {
    return Notification.create({ userId, title, message, type });
  }

  /**
   * Get notifications for a user (paginated).
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return { notifications, total, unreadCount, page, limit };
  }

  /**
   * Mark a notification as read.
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true }
    );

    return notification;
  }

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
  }

  // ============================================
  // Convenience methods for common notifications
  // ============================================

  async notifyBookingRequest(workerId: string, customerName: string) {
    return this.create(
      workerId,
      'New Booking Request',
      `${customerName} has requested a booking with you`,
      NotificationType.BOOKING_REQUEST
    );
  }

  async notifyBookingAccepted(customerId: string, workerName: string) {
    return this.create(
      customerId,
      'Booking Accepted',
      `${workerName} has accepted your booking`,
      NotificationType.BOOKING_ACCEPTED
    );
  }

  async notifyBookingRejected(customerId: string, workerName: string) {
    return this.create(
      customerId,
      'Booking Rejected',
      `${workerName} has rejected your booking`,
      NotificationType.BOOKING_REJECTED
    );
  }

  async notifyBookingCompleted(customerId: string) {
    return this.create(
      customerId,
      'Job Completed',
      'Your booking has been completed. Please leave a review!',
      NotificationType.BOOKING_COMPLETED
    );
  }

  async notifyPaymentSuccess(workerId: string, amount: number) {
    return this.create(
      workerId,
      'Payment Received',
      `Payment of ₹${amount} has been received for your completed job`,
      NotificationType.PAYMENT_SUCCESS
    );
  }

  async notifyReviewReceived(workerId: string, rating: number) {
    return this.create(
      workerId,
      'New Review',
      `You received a ${rating}-star review`,
      NotificationType.REVIEW_RECEIVED
    );
  }

  async notifyDisputeRaised(userId: string) {
    return this.create(
      userId,
      'Dispute Raised',
      'A dispute has been raised on your booking',
      NotificationType.DISPUTE_RAISED
    );
  }

  async notifyDisputeResolved(userId: string) {
    return this.create(
      userId,
      'Dispute Resolved',
      'Your dispute has been resolved',
      NotificationType.DISPUTE_RESOLVED
    );
  }

  async notifyVerificationUpdate(workerId: string, status: string) {
    return this.create(
      workerId,
      'Verification Update',
      `Your skill verification has been ${status.toLowerCase()}`,
      NotificationType.VERIFICATION_UPDATE
    );
  }
}

export default new NotificationService();
