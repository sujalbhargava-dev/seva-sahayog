import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/database';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { Role } from '../utils/constants';
import { RegisterInput, LoginInput, AuthTokens, JwtPayload, IUser } from '../types';

class AuthService {
  /**
   * Register a new user (Customer or Worker).
   * If role is WORKER, also creates a WorkerProfile.
   */
  async register(input: RegisterInput): Promise<{ user: Partial<IUser>; tokens: AuthTokens }> {
    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', input.email)
      .maybeSingle();

    if (existingEmail) {
      throw ApiError.conflict('Email already registered');
    }

    // Check if phone already exists
    const { data: existingPhone } = await supabase
      .from('users')
      .select('id')
      .eq('phone', input.phone)
      .maybeSingle();

    if (existingPhone) {
      throw ApiError.conflict('Phone number already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name: input.name,
        phone: input.phone,
        email: input.email,
        password_hash: passwordHash,
        role: input.role,
        language: input.language || 'EN',
      })
      .select()
      .single();

    if (userError || !user) {
      throw new ApiError(500, 'Failed to create user: ' + userError?.message);
    }

    // Create worker profile if worker
    if (input.role === Role.WORKER) {
      const { error: profileError } = await supabase
        .from('worker_profiles')
        .insert({ user_id: user.id });
        
      if (profileError) {
        // Rollback user creation if profile fails
        await supabase.from('users').delete().eq('id', user.id);
        throw new ApiError(500, 'Failed to create worker profile: ' + profileError.message);
      }
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      role: user.role,
    });

    // Store refresh token
    await supabase
      .from('users')
      .update({ refresh_token: tokens.refreshToken })
      .eq('id', user.id);

    // Remove password hash from response
    const { password_hash, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  /**
   * Login with email and password.
   */
  async login(input: LoginInput): Promise<{ user: Partial<IUser>; tokens: AuthTokens }> {
    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', input.email)
      .maybeSingle();

    if (error || !user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.is_active) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, user.password_hash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      role: user.role,
    });

    // Store refresh token
    await supabase
      .from('users')
      .update({ refresh_token: tokens.refreshToken })
      .eq('id', user.id);

    // Remove password hash from response
    const { password_hash, ...safeUser } = user;
    return { user: safeUser, tokens };
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

      // Find user
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .maybeSingle();

      if (!user || user.refresh_token !== refreshToken) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        userId: user.id,
        role: user.role,
      });

      // Update stored refresh token
      await supabase
        .from('users')
        .update({ refresh_token: tokens.refreshToken })
        .eq('id', user.id);

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
    await supabase
      .from('users')
      .update({ refresh_token: null })
      .eq('id', userId);
  }

  /**
   * Get current user profile.
   */
  async getMe(userId: string): Promise<Partial<IUser>> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      throw ApiError.notFound('User not found');
    }
    
    const { password_hash, ...safeUser } = user;
    return safeUser;
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
