import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { PaymentStatus, PayoutStatus } from '../utils/constants';

// ============================================
// Interface
// ============================================
export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  workerId: Types.ObjectId;
  amount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: PaymentStatus;
  payoutStatus: PayoutStatus;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Schema
// ============================================
const paymentSchema = new Schema<IPayment>(
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      unique: true,
      sparse: true, // Allow multiple empty strings
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    payoutStatus: {
      type: String,
      enum: Object.values(PayoutStatus),
      default: PayoutStatus.PENDING,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// Indexes
// ============================================
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ workerId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ status: 1 });

// ============================================
// Model
// ============================================
const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
