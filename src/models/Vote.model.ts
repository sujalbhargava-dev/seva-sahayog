import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ============================================
// Interface
// ============================================
export interface IVote extends Document {
  policyId: Types.ObjectId;
  workerId: Types.ObjectId;
  selectedOption: string;
  createdAt: Date;
}

// ============================================
// Schema
// ============================================
const voteSchema = new Schema<IVote>(
  {
    policyId: {
      type: Schema.Types.ObjectId,
      ref: 'PolicyVote',
      required: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    selectedOption: {
      type: String,
      required: [true, 'Selected option is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ============================================
// Indexes — one vote per worker per policy
// ============================================
voteSchema.index({ policyId: 1, workerId: 1 }, { unique: true });

// ============================================
// Model
// ============================================
const Vote: Model<IVote> = mongoose.model<IVote>('Vote', voteSchema);

export default Vote;
