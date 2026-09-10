import mongoose, { Schema, Document, Model } from 'mongoose';

// ============================================
// Interface
// ============================================
export interface IService extends Document {
  name: string;
  category: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Schema
// ============================================
const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// Indexes
// ============================================
serviceSchema.index({ category: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

// ============================================
// Model
// ============================================
const Service: Model<IService> = mongoose.model<IService>('Service', serviceSchema);

export default Service;
