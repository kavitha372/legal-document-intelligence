// Server entry point - Module 1: Service startup

import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import prisma from './utils/prisma';

async function startServer(): Promise<void> {
  try {
    // Verify database connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection verified');

    const server = app.listen(config.port, () => {
      logger.info(`Legal Document Intelligence Platform started`, {
        port: config.port,
        environment: config.nodeEnv,
        apiDocs: `http://localhost:${config.port}/api/docs`,
      });
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database disconnected. Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server', { error: (err as Error).message });
    process.exit(1);
  }
}

startServer();
