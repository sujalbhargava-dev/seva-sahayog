import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { VerificationStatus } from '../utils/constants';

// ============================================
// Interface
// ============================================
export interface IWorkerProfile extends Document {
  userId: Types.ObjectId;
  skills: string[];
  experience: number;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude] — GeoJSON
    address: string;
  };
  availability: boolean;
  rating: number;
  totalJobs: number;
  verificationStatus: VerificationStatus;
  verificationVideoUrl: string;
  cooperativeMember: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Schema
// ============================================
const workerProfileSchema = new Schema<IWorkerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: {
        type: String,
        default: '',
      },
    },
    availability: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalJobs: {
      type: Number,
      default: 0,
      min: 0,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
    verificationVideoUrl: {
      type: String,
      default: '',
    },
    cooperativeMember: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// Indexes
// ============================================
workerProfileSchema.index({ location: '2dsphere' });
workerProfileSchema.index({ skills: 1 });
workerProfileSchema.index({ availability: 1 });
workerProfileSchema.index({ rating: -1 });
workerProfileSchema.index({ verificationStatus: 1 });

// ============================================
// Model
// ============================================
const WorkerProfile: Model<IWorkerProfile> = mongoose.model<IWorkerProfile>(
  'WorkerProfile',
  workerProfileSchema
);

export default WorkerProfile;
