import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { PolicyStatus } from '../utils/constants';

// ============================================
// Interface
// ============================================
export interface IPolicyVote extends Document {
  title: string;
  description: string;
  options: string[];
  startDate: Date;
  endDate: Date;
  status: PolicyStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Schema
// ============================================
const policyVoteSchema = new Schema<IPolicyVote>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    options: {
      type: [String],
      required: [true, 'At least 2 options are required'],
      validate: {
        validator: (v: string[]) => v.length >= 2,
        message: 'Policy vote must have at least 2 options',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: Object.values(PolicyStatus),
      default: PolicyStatus.ACTIVE,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// Indexes
// ============================================
policyVoteSchema.index({ status: 1 });
policyVoteSchema.index({ endDate: 1 });

// ============================================
// Model
// ============================================
const PolicyVote: Model<IPolicyVote> = mongoose.model<IPolicyVote>(
  'PolicyVote',
  policyVoteSchema
);

export default PolicyVote;
