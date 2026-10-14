// Prisma client singleton - prevents multiple connections during development

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connect and verify on startup
prisma.$connect()
  .then(() => logger.info('Database connection established'))
  .catch((err: Error) => {
    logger.error('Failed to connect to database', { error: err.message });
    process.exit(1);
  });

export default prisma;
