import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Role, Language } from '../utils/constants';

// ============================================
// Interface
// ============================================
export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: Role;
  language: string;
  profileImage: string;
  isActive: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ============================================
// Schema
// ============================================
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't include in queries by default
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: [true, 'Role is required'],
    },
    language: {
      type: String,
      enum: Object.values(Language),
      default: Language.EN,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// Indexes
// ============================================
// email and phone indexes are auto-created by unique:true
userSchema.index({ role: 1 });

// ============================================
// Pre-save: Hash password
// ============================================
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// ============================================
// Methods
// ============================================
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

// ============================================
// Model
// ============================================
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
