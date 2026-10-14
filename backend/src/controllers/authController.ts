// Authentication controller - Module 4: Authentication and authorization

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import { recordAuditEvent, AuditActions } from '../services/auditService';
import { UserRole } from '../types';

const VALID_ROLES = ['ADMIN', 'LEGAL_REVIEWER', 'READ_ONLY'];

const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(128),
});

const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores allowed'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8).max(128, 'Password must be between 8 and 128 characters'),
});

const createUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['ADMIN', 'LEGAL_REVIEWER', 'READ_ONLY']),
});

const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['ADMIN', 'LEGAL_REVIEWER', 'READ_ONLY']).optional(),
  email: z.string().email().optional(),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map(e => e.message).join(', ');
      throw new AppError(400, msg || 'Validation error');
    }

    const { username, email, password } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      throw new AppError(409, 'Username or email is already in use');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, role: 'READ_ONLY' },
      select: { id: true, username: true, email: true, role: true },
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    await recordAuditEvent({
      userId: user.id,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: user.id,
      requestId: req.requestId,
    });

    res.status(201).json({
      success: true,
      data: { token, user },
    });
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, 'Invalid login request');
    }

    const { username, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }], isActive: true },
    });

    if (!user) {
      await bcrypt.compare(password, '$2a$12$placeholder.hash.to.prevent.timing.attacks');
      await recordAuditEvent({ action: AuditActions.LOGIN_FAILURE, outcome: 'FAILURE', requestId: req.requestId });
      throw new AppError(401, 'Invalid username or password');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      await recordAuditEvent({ userId: user.id, action: AuditActions.LOGIN_FAILURE, outcome: 'FAILURE', requestId: req.requestId });
      throw new AppError(401, 'Invalid username or password');
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    await recordAuditEvent({ userId: user.id, action: AuditActions.LOGIN_SUCCESS, requestId: req.requestId });

    res.json({
      success: true,
      data: { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } },
    });
  } catch (err) { next(err); }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await recordAuditEvent({ userId: req.user?.userId, action: AuditActions.LOGOUT, requestId: req.requestId });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true },
    });
    if (!user || !user.isActive) throw new AppError(401, 'User account not found or deactivated');
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: { users } });
  } catch (err) { next(err); }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Validation error', details: parsed.error.errors });
      return;
    }
    const { username, email, password, role } = parsed.data;

    if (role === UserRole.ADMIN && req.user?.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Only administrators can create administrator accounts');
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (existing) throw new AppError(409, 'Username or email already exists');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, role },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });

    await recordAuditEvent({ userId: req.user?.userId, action: AuditActions.USER_CREATE, entityType: 'User', entityId: user.id, requestId: req.requestId });
    res.status(201).json({ success: true, data: { user } });
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (id === req.user?.userId && req.body.role) {
      throw new AppError(403, 'You cannot change your own role through this endpoint');
    }
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Validation error', details: parsed.error.errors });
      return;
    }
    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, username: true, email: true, role: true, isActive: true, updatedAt: true },
    });
    await recordAuditEvent({ userId: req.user?.userId, action: AuditActions.USER_UPDATE, entityType: 'User', entityId: id, requestId: req.requestId });
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page  = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '50', 10)));
    const skip  = (page - 1) * limit;

    await recordAuditEvent({ userId: req.user?.userId, action: AuditActions.AUDIT_LOG_VIEW, requestId: req.requestId });

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, role: true } } },
      }),
      prisma.auditLog.count(),
    ]);

    res.json({ success: true, data: { logs }, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
}
