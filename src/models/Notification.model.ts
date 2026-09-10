import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { NotificationType } from '../utils/constants';

// ============================================
// Interface
// ============================================
export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

// ============================================
// Schema
// ============================================
const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.GENERAL,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ============================================
// Indexes
// ============================================
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // TTL: 30 days

// ============================================
// Model
// ============================================
const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);

export default Notification;
