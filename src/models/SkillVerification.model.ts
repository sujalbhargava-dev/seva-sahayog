import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { VerificationStatus } from '../utils/constants';

// ============================================
// Interface
// ============================================
export interface ISkillVerification extends Document {
  workerId: Types.ObjectId;
  videoUrl: string;
  skills: string[];
  verificationStatus: VerificationStatus;
  reviewedBy: Types.ObjectId | null;
  reviewerComments: string;
  createdAt: Date;
}

// ============================================
// Schema
// ============================================
const skillVerificationSchema = new Schema<ISkillVerification>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    skills: {
      type: [String],
      required: [true, 'Skills are required'],
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewerComments: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ============================================
// Indexes
// ============================================
skillVerificationSchema.index({ workerId: 1 });
skillVerificationSchema.index({ verificationStatus: 1 });

// ============================================
// Model
// ============================================
const SkillVerification: Model<ISkillVerification> = mongoose.model<ISkillVerification>(
  'SkillVerification',
  skillVerificationSchema
);

export default SkillVerification;
