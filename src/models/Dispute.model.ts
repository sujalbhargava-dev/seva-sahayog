import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { DisputeStatus } from '../utils/constants';

// ============================================
// Interface
// ============================================
export interface IDispute extends Document {
  bookingId: Types.ObjectId;
  raisedBy: Types.ObjectId;
  reason: string;
  description: string;
  evidence: string[];
  status: DisputeStatus;
  resolution: string;
  resolvedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Schema
// ============================================
const disputeSchema = new Schema<IDispute>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    evidence: {
      type: [String], // Cloudinary URLs
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(DisputeStatus),
      default: DisputeStatus.OPEN,
    },
    resolution: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// Indexes
// ============================================
disputeSchema.index({ bookingId: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ raisedBy: 1 });

// ============================================
// Model
// ============================================
const Dispute: Model<IDispute> = mongoose.model<IDispute>('Dispute', disputeSchema);

export default Dispute;
