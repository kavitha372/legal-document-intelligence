// Test setup - configure test database environment before any imports
import path from 'path';
import fs from 'fs';

// Must be set BEFORE any Prisma/app imports
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET   = 'test-jwt-secret-for-testing-only-min-32c';
process.env.NODE_ENV     = 'test';
process.env.UPLOAD_DIR   = path.join(__dirname, '../test_uploads');
process.env.CORS_ORIGIN  = 'http://localhost:5173';
process.env.PORT         = '3002'; // different port from dev

// Ensure test upload directory exists
const testUploadDir = path.join(__dirname, '../test_uploads');
if (!fs.existsSync(testUploadDir)) {
  fs.mkdirSync(testUploadDir, { recursive: true });
}

// Push schema to test database
import { execSync } from 'child_process';
try {
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env },
    stdio: 'pipe',
  });
} catch (e: any) {
  // May warn about data loss; that is acceptable for the test DB
  const msg = e.stderr?.toString() || e.message || '';
  if (!msg.includes('warn')) {
    console.warn('DB push note:', msg.slice(0, 200));
  }
}
