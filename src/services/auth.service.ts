import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.model';
import WorkerProfile from '../models/WorkerProfile.model';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { Role } from '../utils/constants';
import { RegisterInput, LoginInput, AuthTokens, JwtPayload } from '../types';

class AuthService {
  /**
   * Register a new user (Customer or Worker).
   * If role is WORKER, also creates a WorkerProfile.
   */
  async register(input: RegisterInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    // Check if email already exists
    const existingEmail = await User.findOne({ email: input.email });
    if (existingEmail) {
      throw ApiError.conflict('Email already registered');
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone: input.phone });
    if (existingPhone) {
      throw ApiError.conflict('Phone number already registered');
    }

    // Create user
    const user = await User.create({
      name: input.name,
      phone: input.phone,
      email: input.email,
      passwordHash: input.password, // Pre-save hook will hash it
      role: input.role,
      language: input.language || 'en',
    });

    // Create worker profile if worker
    if (input.role === Role.WORKER) {
      await WorkerProfile.create({ userId: user._id });
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user._id.toString(),
      role: user.role,
    });

    // Store refresh token
    await User.findByIdAndUpdate(user._id, {
      refreshToken: tokens.refreshToken,
    });

    return { user, tokens };
  }

  /**
   * Login with email and password.
   */
  async login(input: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    // Find user with password field
    const user = await User.findOne({ email: input.email }).select('+passwordHash');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user._id.toString(),
      role: user.role,
    });

    // Store refresh token
    await User.findByIdAndUpdate(user._id, {
      refreshToken: tokens.refreshToken,
    });

    return { user, tokens };
  }

  /**
   * Refresh access token using refresh token.
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        env.JWT_REFRESH_SECRET
      ) as JwtPayload;

      // Find user and verify stored refresh token
      const user = await User.findById(decoded.userId).select('+refreshToken');

      if (!user || user.refreshToken !== refreshToken) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        userId: user._id.toString(),
        role: user.role,
      });

      // Update stored refresh token
      await User.findByIdAndUpdate(user._id, {
        refreshToken: tokens.refreshToken,
      });

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  }

  /**
   * Logout by clearing refresh token.
   */
  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: '' });
  }

  /**
   * Get current user profile.
   */
  async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  /**
   * Generate access and refresh JWT tokens.
   */
  private generateTokens(payload: JwtPayload): AuthTokens {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }
}

export default new AuthService();
