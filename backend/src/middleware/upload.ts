// File upload middleware - Module 4: File security
// Validates type, size, enforces stored filename, keeps files outside public dir

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { AppError } from './errorHandler';

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, _file, cb) => {
    // Module 4: Use a random UUID-based filename — never trust the original filename
    const randomName = `${uuidv4()}${path.extname(_file.originalname).toLowerCase()}`;
    cb(null, randomName);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  // Module 4: Validate both extension and MIME type
  if (!config.allowedExtensions.includes(ext) || !config.allowedMimeTypes.includes(mime)) {
    cb(new AppError(400, 'Only PDF files are allowed'));
    return;
  }
  cb(null, true);
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
    files: 1,
  },
}).single('file');

/**
 * Wraps multer upload as a Promise to use in async controllers
 */
export function handleUpload(req: Express.Request, res: Express.Response): Promise<void> {
  return new Promise((resolve, reject) => {
    uploadMiddleware(req as any, res as any, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          reject(new AppError(400, `File too large. Maximum size is ${config.maxFileSizeMb} MB`));
        } else {
          reject(new AppError(400, `Upload error: ${err.message}`));
        }
      } else if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
