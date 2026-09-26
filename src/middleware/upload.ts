import multer from 'multer';
import { Request } from 'express';
import imagekit from '../config/imagekit';
import { ApiError } from '../utils/ApiError';

/**
 * Multer configuration with memory storage.
 * Files are stored in memory buffer before uploading to ImageKit.
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
 * Upload a file buffer to ImageKit.
 * @param fileBuffer The file buffer from multer
 * @param folder The ImageKit folder
 * @param resourceType 'image' or 'video' (Optional for ImageKit but kept for signature compatibility)
 * @returns ImageKit upload result with url
 */
export async function uploadToImageKit(
  fileBuffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<{ url: string; publicId: string }> {
  try {
    const result = await imagekit.files.upload({
      file: fileBuffer.toString('base64'), 
      fileName: 'upload', // ImageKit will auto-generate unique names or we can use original names
      folder: `/sewashayog/${folder}`,
      // Optionally handle transformations or resource types here if needed
    });

    return {
      url: result.url || '',
      publicId: result.fileId || '',
    };
  } catch (error: any) {
    throw new ApiError(500, `ImageKit upload failed: ${error.message}`);
  }
}
