import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { PayoutStatus } from '../utils/constants';

// ============================================
// Interface
// ============================================
export interface IWorkerEarning extends Document {
  workerId: Types.ObjectId;
  bookingId: Types.ObjectId;
  grossAmount: number;
  platformFee: number;
  welfareContribution: number;
  netAmount: number;
  payoutStatus: PayoutStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Schema
// ============================================
const workerEarningSchema = new Schema<IWorkerEarning>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One earning record per booking
    },
    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      min: 0,
    },
    welfareContribution: {
      type: Number,
      required: true,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    payoutStatus: {
      type: String,
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// Pre-validate: Calculate netAmount
// ============================================
workerEarningSchema.pre('validate', function (next) {
  if (this.grossAmount !== undefined) {
    this.netAmount = this.grossAmount - this.platformFee - this.welfareContribution;
  }
  next();
});

// ============================================
// Indexes
// ============================================
workerEarningSchema.index({ workerId: 1 });
workerEarningSchema.index({ payoutStatus: 1 });

// ============================================
// Model
// ============================================
const WorkerEarning: Model<IWorkerEarning> = mongoose.model<IWorkerEarning>(
  'WorkerEarning',
  workerEarningSchema
);

export default WorkerEarning;
