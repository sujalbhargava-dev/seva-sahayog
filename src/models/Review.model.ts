import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ============================================
// Interface
// ============================================
export interface IReview extends Document {
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  workerId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

// ============================================
// Schema
// ============================================
const reviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
      maxlength: 1000,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ============================================
// Indexes — one review per booking per customer
// ============================================
reviewSchema.index({ bookingId: 1, customerId: 1 }, { unique: true });
reviewSchema.index({ workerId: 1 });
reviewSchema.index({ rating: -1 });

// ============================================
// Model
// ============================================
const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
