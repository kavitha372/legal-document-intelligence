// Authentication and authorization middleware
// Module 4: JWT verification, role-based access control

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload, UserRole } from '../types';
import { logger } from '../utils/logger';

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      requestId?: string;
    }
  }
}

/**
 * Attach a request ID for correlation across logs
 */
export function requestId(req: Request, _res: Response, next: NextFunction): void {
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  next();
}

/**
 * Verify JWT and attach user payload to request.
 * Module 4: All protected routes require valid JWT.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    logger.warn('JWT verification failed', { requestId: req.requestId, error: (err as Error).message });
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

/**
 * Require one of the specified roles.
 * Module 4: Enforces RBAC at the middleware layer before any controller logic runs.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    if (!roles.includes(req.user.role as UserRole)) {
      logger.warn('Access denied — insufficient role', {
        userId: req.user.userId,
        requiredRoles: roles,
        actualRole: req.user.role,
        path: req.path,
        requestId: req.requestId,
      });
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

/**
 * Convenience: admin-only middleware
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Convenience: reviewer or admin
 */
export const requireReviewer = requireRole(UserRole.ADMIN, UserRole.LEGAL_REVIEWER);
