import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, '../../../.env') });

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/narang-textile',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  duplicateThreshold: Number(process.env.DUPLICATE_THRESHOLD || 95),
  possibleDuplicateThreshold: Number(process.env.POSSIBLE_DUPLICATE_THRESHOLD || 85),
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB || 10),
  apiBaseUrl: process.env.VITE_API_URL || 'http://localhost:5000/api'
};
