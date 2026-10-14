// Express application setup - Module 1: Cloud Product and Platform Engineering
// Module 4: Security headers, rate limiting, CORS, input validation

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { requestId } from './middleware/auth';
import { errorHandler, notFound } from './middleware/errorHandler';
import routes from './routes';
import { logger } from './utils/logger';

const app = express();

// ---------------------------------------------------------------------------
// Security headers - Module 4: Security
// ---------------------------------------------------------------------------
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Set appropriately for production
  })
);

// ---------------------------------------------------------------------------
// CORS - allow only the configured frontend origin
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// Compression and JSON parsing
// ---------------------------------------------------------------------------
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ---------------------------------------------------------------------------
// Request ID and logging
// ---------------------------------------------------------------------------
app.use(requestId);
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
    skip: (req) => req.path === '/api/health', // Don't log health checks
  })
);

// ---------------------------------------------------------------------------
// Global rate limiting - Module 4: Abuse prevention
// ---------------------------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.authRateLimitMax,
  message: { success: false, error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);

// ---------------------------------------------------------------------------
// Swagger API documentation - Module 1: API documentation
// ---------------------------------------------------------------------------
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secure AI-Powered Legal Document Intelligence API',
      version: '1.0.0',
      description:
        'REST API for the Legal Document Intelligence and Compliance Platform. ' +
        'Provides document upload, extraction, search, question-answering, and checklist functionality. ' +
        'All results are preliminary and require human review.',
      contact: { name: 'Wipro CPPE Project' },
    },
    servers: [{ url: `http://localhost:${config.port}/api`, description: 'Local development' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// ---------------------------------------------------------------------------
// Application routes
// ---------------------------------------------------------------------------
app.use('/api', routes);

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

export default app;
