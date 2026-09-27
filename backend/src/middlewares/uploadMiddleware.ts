import multer from 'multer';
import { UPLOAD_MAX_BYTES } from '../config/upload';

export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_BYTES, files: 1 }
});
