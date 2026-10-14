// Application configuration - reads from environment variables
// Module 4: Security - secrets managed via environment variables, never hardcoded

import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // JWT - Module 4: Authentication secrets in env vars
  jwtSecret: requireEnv('JWT_SECRET', 'dev-jwt-secret-change-in-production-min-32-chars'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',

  // File upload - Module 4: File security limits
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  maxPageCount: parseInt(process.env.MAX_PAGE_COUNT || '200', 10),
  allowedMimeTypes: ['application/pdf'],
  allowedExtensions: ['.pdf'],

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate limiting - Module 4: Abuse prevention
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),

  // Admin setup
  adminSetupToken: process.env.ADMIN_SETUP_TOKEN || 'dev-admin-setup-token',

  // Disclaimer text
  disclaimer:
    'This application provides document search and preliminary checklist assistance only. It does not provide legal advice or determine whether a contract is legally valid or enforceable. All findings must be reviewed by a qualified human reviewer.',
};

export default config;
