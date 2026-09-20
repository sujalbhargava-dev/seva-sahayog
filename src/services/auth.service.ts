import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/database';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { Role } from '../utils/constants';
import { RegisterInput, LoginInput, AuthTokens, JwtPayload, ICustomer, IWorker } from '../types';

class AuthService {
  /**
   * Register a new user (Customer or Worker) into their respective tables.
   */
  async register(input: RegisterInput): Promise<{ user: Partial<ICustomer | IWorker>; tokens: AuthTokens }> {
    const table = input.role === Role.ADMIN ? 'admins' : (input.role === Role.WORKER ? 'workers' : 'customers');

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from(table)
      .select('id')
      .eq('email', input.email)
      .maybeSingle();

    if (existingEmail) {
      throw ApiError.conflict('Email already registered');
    }

    // Check if phone already exists
    const { data: existingPhone } = await supabase
      .from(table)
      .select('id')
      .eq('phone', input.phone)
      .maybeSingle();

    if (existingPhone) {
      throw ApiError.conflict('Phone number already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    // Create user in the specific table
    const { data: user, error: userError } = await supabase
      .from(table)
      .insert({
        name: input.name,
        phone: input.phone,
        email: input.email,
        password_hash: passwordHash,
        language: input.language || 'EN',
      })
      .select()
      .single();

    if (userError || !user) {
      throw new ApiError(500, `Failed to create ${input.role.toLowerCase()}: ` + userError?.message);
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      role: input.role, // We store the role in JWT so we know which table to query later
    });

    // Store refresh token
    await supabase
      .from(table)
      .update({ refresh_token: tokens.refreshToken })
      .eq('id', user.id);

    // Remove password hash from response
    const { password_hash, ...safeUser } = user;
    // Append role dynamically for the frontend
    return { user: { ...safeUser, role: input.role }, tokens };
  }

  /**
   * Login with email and password.
   * We will check both tables if role isn't explicitly provided, or we can check the specified role.
   * Assuming the input doesn't enforce role, we check customers, then workers.
   */
  async login(input: LoginInput & { role?: Role }): Promise<{ user: Partial<ICustomer | IWorker>; tokens: AuthTokens }> {
    let user = null;
    let table = 'customers';
    let role = Role.CUSTOMER;

    if (input.role === Role.ADMIN) {
      table = 'admins';
      role = Role.ADMIN;
      const { data } = await supabase.from(table).select('*').eq('email', input.email).maybeSingle();
      user = data;
    } else if (input.role === Role.WORKER) {
      table = 'workers';
      role = Role.WORKER;
      const { data } = await supabase.from(table).select('*').eq('email', input.email).maybeSingle();
      user = data;
    } else if (input.role === Role.CUSTOMER) {
      table = 'customers';
      role = Role.CUSTOMER;
      const { data } = await supabase.from(table).select('*').eq('email', input.email).maybeSingle();
      user = data;
    } else {
      // If role not provided in request, check customers first, then workers, then admins
      let { data } = await supabase.from('customers').select('*').eq('email', input.email).maybeSingle();
      if (data) {
        user = data;
        role = Role.CUSTOMER;
        table = 'customers';
      } else {
        const { data: wData } = await supabase.from('workers').select('*').eq('email', input.email).maybeSingle();
        if (wData) {
          user = wData;
          role = Role.WORKER;
          table = 'workers';
        } else {
          const { data: aData } = await supabase.from('admins').select('*').eq('email', input.email).maybeSingle();
          if (aData) {
            user = aData;
            role = Role.ADMIN;
            table = 'admins';
          }
        }
      }
    }

    if (!user) {
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
      role: role,
    });

    // Store refresh token
    await supabase
      .from(table)
      .update({ refresh_token: tokens.refreshToken })
      .eq('id', user.id);

    // Remove password hash from response
    const { password_hash, ...safeUser } = user;
    return { user: { ...safeUser, role }, tokens };
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

      const table = decoded.role === Role.ADMIN ? 'admins' : (decoded.role === Role.WORKER ? 'workers' : 'customers');

      // Find user
      const { data: user } = await supabase
        .from(table)
        .select('*')
        .eq('id', decoded.userId)
        .maybeSingle();

      if (!user || user.refresh_token !== refreshToken) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        userId: user.id,
        role: decoded.role,
      });

      // Update stored refresh token
      await supabase
        .from(table)
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
  async logout(userId: string, role: Role): Promise<void> {
    const table = role === Role.ADMIN ? 'admins' : (role === Role.WORKER ? 'workers' : 'customers');
    await supabase
      .from(table)
      .update({ refresh_token: null })
      .eq('id', userId);
  }

  /**
   * Get current user profile.
   */
  async getMe(userId: string, role: Role): Promise<Partial<ICustomer | IWorker>> {
    const table = role === Role.ADMIN ? 'admins' : (role === Role.WORKER ? 'workers' : 'customers');
    
    const { data: user, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      throw ApiError.notFound('User not found');
    }
    
    const { password_hash, ...safeUser } = user;
    return { ...safeUser, role };
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
