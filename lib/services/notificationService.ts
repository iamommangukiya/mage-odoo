import dbConnect from '@/lib/db';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import Swap from '@/lib/models/Swap';

export class NotificationService {
  private static socketServer: any = null;

  public static setSocketServer(socketServer: any) {
    this.socketServer = socketServer;
  }

  // Create and send a notification
  public static async createNotification(data: {
    user_id: string;
    type: 'swap_request' | 'swap_accepted' | 'swap_rejected' | 'new_review' | 'message';
    title: string;
    message: string;
    data?: any;
  }) {
    try {
      await dbConnect();
      
      const notification = await Notification.create({
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        is_read: false,
        created_at: new Date()
      });

      // Send real-time notification if socket server is available
      if (this.socketServer) {
        const user = await User.findById(data.user_id);
        if (user) {
          await this.socketServer.sendNotification(user.email, {
            id: notification._id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            created_at: notification.created_at
          });
        }
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create swap request notification
  public static async createSwapRequestNotification(swapId: string, fromUserId: string, toUserId: string) {
    try {
      const fromUser = await User.findById(fromUserId);
      const toUser = await User.findById(toUserId);
      
      if (!fromUser || !toUser) {
        throw new Error('Users not found');
      }

      await this.createNotification({
        user_id: toUserId,
        type: 'swap_request',
        title: 'New Skill Swap Request',
        message: `${fromUser.name} wants to swap skills with you!`,
        data: {
          swap_id: swapId,
          from_user_id: fromUserId,
          to_user_id: toUserId
        }
      });
    } catch (error) {
      console.error('Error creating swap request notification:', error);
      throw error;
    }
  }

  // Create swap accepted notification
  public static async createSwapAcceptedNotification(swapId: string, fromUserId: string, toUserId: string) {
    try {
      const fromUser = await User.findById(fromUserId);
      const toUser = await User.findById(toUserId);
      
      if (!fromUser || !toUser) {
        throw new Error('Users not found');
      }

      await this.createNotification({
        user_id: fromUserId,
        type: 'swap_accepted',
        title: 'Swap Request Accepted!',
        message: `${toUser.name} accepted your skill swap request!`,
        data: {
          swap_id: swapId,
          from_user_id: fromUserId,
          to_user_id: toUserId
        }
      });
    } catch (error) {
      console.error('Error creating swap accepted notification:', error);
      throw error;
    }
  }

  // Create swap rejected notification
  public static async createSwapRejectedNotification(swapId: string, fromUserId: string, toUserId: string) {
    try {
      const fromUser = await User.findById(fromUserId);
      const toUser = await User.findById(toUserId);
      
      if (!fromUser || !toUser) {
        throw new Error('Users not found');
      }

      await this.createNotification({
        user_id: fromUserId,
        type: 'swap_rejected',
        title: 'Swap Request Declined',
        message: `${toUser.name} declined your skill swap request.`,
        data: {
          swap_id: swapId,
          from_user_id: fromUserId,
          to_user_id: toUserId
        }
      });
    } catch (error) {
      console.error('Error creating swap rejected notification:', error);
      throw error;
    }
  }

  // Create new review notification
  public static async createReviewNotification(reviewerId: string, reviewedUserId: string, reviewId: string) {
    try {
      const reviewer = await User.findById(reviewerId);
      const reviewedUser = await User.findById(reviewedUserId);
      
      if (!reviewer || !reviewedUser) {
        throw new Error('Users not found');
      }

      await this.createNotification({
        user_id: reviewedUserId,
        type: 'new_review',
        title: 'New Review Received',
        message: `${reviewer.name} left you a review!`,
        data: {
          review_id: reviewId,
          from_user_id: reviewerId,
          to_user_id: reviewedUserId
        }
      });
    } catch (error) {
      console.error('Error creating review notification:', error);
      throw error;
    }
  }

  // Get notifications for a user
  public static async getUserNotifications(userId: string, limit: number = 20) {
    try {
      await dbConnect();
      
      const notifications = await Notification.find({ user_id: userId })
        .sort({ created_at: -1 })
        .limit(limit)
        .populate('data.from_user_id', 'name photo_url')
        .populate('data.to_user_id', 'name photo_url');

      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  public static async markAsRead(notificationId: string, userId: string) {
    try {
      await dbConnect();
      
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user_id: userId },
        { is_read: true },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  public static async markAllAsRead(userId: string) {
    try {
      await dbConnect();
      
      await Notification.updateMany(
        { user_id: userId, is_read: false },
        { is_read: true }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count for a user
  public static async getUnreadCount(userId: string) {
    try {
      await dbConnect();
      
      const count = await Notification.countDocuments({
        user_id: userId,
        is_read: false
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
} 