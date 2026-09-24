import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { supabase } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { Role } from '../utils/constants';

/**
 * PATCH /api/users/profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;
  const table = role === Role.WORKER ? 'workers' : 'customers';

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
      .from(table)
      .select('id')
      .eq('phone', phone)
      .neq('id', userId)
      .maybeSingle();

    if (existing) {
      throw ApiError.conflict('Phone number already in use by another account');
    }
  }

  const { data: user, error } = await supabase
    .from(table)
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

/**
 * POST /api/users/profile-picture
 */
export const uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const role = req.user!.role;
  const table = role === Role.WORKER ? 'workers' : 'customers';

  if (!req.file) {
    throw ApiError.badRequest('No image file provided');
  }

  const fileExt = req.file.originalname.split('.').pop() || 'jpg';
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  
  // 1. Upload to Supabase Storage (bucket named 'avatars')
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true
    });

  if (uploadError) {
    throw new ApiError(500, 'Failed to upload image to Supabase Storage: ' + uploadError.message);
  }

  // 2. Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  // 3. Update the database record (the column is profile_image)
  const { data: user, error: dbError } = await supabase
    .from(table)
    .update({ profile_image: publicUrl })
    .eq('id', userId)
    .select()
    .single();

  if (dbError || !user) {
    throw new ApiError(500, 'Failed to update database profile');
  }

  // Return the URL so the frontend can immediately update
  res.json(new ApiResponse(200, 'Profile picture updated', { profilePicture: publicUrl }));
});
