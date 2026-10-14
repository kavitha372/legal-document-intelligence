// Authentication tests - Module 4: Security testing
// Tests login, credential validation, and access control

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

describe('Authentication', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user
    const hash = await bcrypt.hash('TestPass@123', 10);
    const user = await prisma.user.create({
      data: {
        username: 'testauth_user',
        email: 'testauth@test.local',
        passwordHash: hash,
        role: 'LEGAL_REVIEWER',
        isActive: true,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: { startsWith: 'testauth' } } });
    await prisma.$disconnect();
  });

  // Test 1: Successful login
  it('should login successfully with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'testauth_user',
      password: 'TestPass@123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.username).toBe('testauth_user');
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Never expose hash
  });

  // Test 2: Incorrect login credentials
  it('should reject login with incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'testauth_user',
      password: 'WrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeUndefined();
  });

  // Test 2b: Unknown username
  it('should reject login with unknown username', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'nonexistent_user',
      password: 'AnyPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 3: Unauthorized admin access
  it('should deny admin endpoint access to non-admin user', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      username: 'testauth_user',
      password: 'TestPass@123',
    });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test: Protected route without token
  it('should reject access to protected routes without a token', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(401);
  });

  // Test: Get /me with valid token
  it('should return current user info for authenticated request', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      username: 'testauth_user',
      password: 'TestPass@123',
    });
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe('testauth_user');
  });
});
