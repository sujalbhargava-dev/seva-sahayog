import multer from 'multer';
import { Request } from 'express';
import cloudinary from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';

/**
 * Multer configuration with memory storage.
 * Files are stored in memory buffer before uploading to Cloudinary.
 */
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed image types
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  // Allowed video types
  const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

  if ([...imageTypes, ...videoTypes].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image (JPEG, PNG, WebP) and video (MP4, WebM, MOV) files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

/**
 * Upload a file buffer to Cloudinary.
 * @param fileBuffer The file buffer from multer
 * @param folder The Cloudinary folder
 * @param resourceType 'image' or 'video'
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sewashayog/${folder}`,
        resource_type: resourceType,
        transformation:
          resourceType === 'image'
            ? [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }]
            : undefined,
      },
      (error, result) => {
        if (error) {
          reject(new ApiError(500, `Cloudinary upload failed: ${error.message}`));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}
