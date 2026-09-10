import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import notificationService from '../services/notification.service';

/**
 * GET /api/notifications
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await notificationService.getUserNotifications(
    req.user!.userId,
    page,
    limit
  );

  res.json(
    new ApiResponse(200, 'Notifications fetched', result.notifications, {
      total: result.total,
      unreadCount: result.unreadCount,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    })
  );
});

/**
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user!.userId
  );

  res.json(
    new ApiResponse(
      200,
      req.t?.('notification.markedRead') || 'Notification marked as read',
      notification
    )
  );
});

/**
 * PATCH /api/notifications/read-all
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user!.userId);

  res.json(
    new ApiResponse(
      200,
      req.t?.('notification.allMarkedRead') || 'All notifications marked as read'
    )
  );
});
