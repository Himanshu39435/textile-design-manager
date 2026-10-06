import cloudinary from '../config/cloudinary.js';
import { env } from '../config/env.js';

export async function uploadToCloudinary(buffer, fileName) {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new Error('Cloudinary is not configured. Add its credentials to the project root .env file and restart the backend.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'narang-textile',
        resource_type: 'image',
        use_filename: true,
        public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '')}`
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}
