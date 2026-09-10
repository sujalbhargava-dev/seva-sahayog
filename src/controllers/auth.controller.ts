import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import authService from '../services/auth.service';

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.register(req.body);

  res.status(201).json(
    new ApiResponse(201, req.t?.('auth.registerSuccess') || 'Registration successful', {
      user,
      ...tokens,
    })
  );
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.login(req.body);

  res.json(
    new ApiResponse(200, req.t?.('auth.loginSuccess') || 'Login successful', {
      user,
      ...tokens,
    })
  );
});

/**
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);

  res.json(
    new ApiResponse(200, req.t?.('auth.tokenRefreshed') || 'Token refreshed', tokens)
  );
});

/**
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!.userId);

  res.json(new ApiResponse(200, req.t?.('auth.logoutSuccess') || 'Logged out successfully'));
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.userId);

  res.json(
    new ApiResponse(200, req.t?.('user.profileFetched') || 'Profile fetched', user)
  );
});
