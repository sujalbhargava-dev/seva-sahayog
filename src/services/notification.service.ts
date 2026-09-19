import { supabase } from '../config/database';
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
    const { data: notification } = await supabase
      .from('notifications')
      .insert({ user_id: userId, title, message, type })
      .select()
      .single();
    return notification;
  }

  /**
   * Get notifications for a user (paginated).
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get paginated notifications
    const { data: notifications, count: total } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return { notifications, total: total || 0, unreadCount: unreadCount || 0, page, limit };
  }

  /**
   * Mark a notification as read.
   */
  async markAsRead(notificationId: string, userId: string) {
    const { data: notification } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    return notification;
  }

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(userId: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
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
