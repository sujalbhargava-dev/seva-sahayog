import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { supabase } from '../config/database';
import { ApiError } from '../utils/ApiError';

/**
 * PATCH /api/users/profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { phone, address, pincode } = req.body;

  const updates: any = {};
  if (phone !== undefined) updates.phone = phone;
  if (address !== undefined) updates.address = address;
  if (pincode !== undefined) updates.pincode = pincode;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json(new ApiResponse(400, 'No updates provided'));
  }

  // If phone is updated, verify it's not already used
  if (phone) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .neq('id', userId)
      .maybeSingle();

    if (existing) {
      throw ApiError.conflict('Phone number already in use by another account');
    }
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error || !user) {
    throw new ApiError(500, 'Failed to update profile: ' + error?.message);
  }

  const { password_hash, ...safeUser } = user;
  res.json(new ApiResponse(200, req.t?.('user.profileUpdated') || 'Profile updated successfully', safeUser));
});
