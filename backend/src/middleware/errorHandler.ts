// Centralized error handling middleware
// Module 1: Consistent error responses across all routes

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      requestId,
    });
    return;
  }

  // Application errors (expected, operational)
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('Application error', {
        message: err.message,
        statusCode: err.statusCode,
        requestId,
        path: req.path,
      });
    }
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      requestId,
    });
    return;
  }

  // Unexpected errors - log fully but return generic message
  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
    requestId,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred',
    requestId,
  });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
}
