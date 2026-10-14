// Access control tests - Module 4: IDOR prevention and RBAC testing
// Verifies users cannot access other users' documents

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

describe('Access Control', () => {
  let reviewer1Token: string;
  let reviewer2Token: string;
  let adminToken: string;
  let reviewer1DocId: string;

  beforeAll(async () => {
    const hash = await bcrypt.hash('TestPass@123', 10);

    const [user1, user2, adminUser] = await Promise.all([
      prisma.user.create({
        data: { username: 'ac_reviewer1', email: 'ac_r1@test.local', passwordHash: hash, role: 'LEGAL_REVIEWER' },
      }),
      prisma.user.create({
        data: { username: 'ac_reviewer2', email: 'ac_r2@test.local', passwordHash: hash, role: 'LEGAL_REVIEWER' },
      }),
      prisma.user.create({
        data: { username: 'ac_admin', email: 'ac_admin@test.local', passwordHash: hash, role: 'ADMIN' },
      }),
    ]);

    // Create a document owned by reviewer1
    const doc = await prisma.document.create({
      data: {
        ownerId: user1.id,
        title: 'Reviewer1 Private Document',
        originalFilename: 'private.pdf',
        storedFilename: 'ac_test_stored.pdf',
        fileHash: 'testhash123',
        extractionStatus: 'EXTRACTED',
        reviewStatus: 'PENDING',
      },
    });
    reviewer1DocId = doc.id;

    // Get tokens
    const [r1, r2, ad] = await Promise.all([
      request(app).post('/api/auth/login').send({ username: 'ac_reviewer1', password: 'TestPass@123' }),
      request(app).post('/api/auth/login').send({ username: 'ac_reviewer2', password: 'TestPass@123' }),
      request(app).post('/api/auth/login').send({ username: 'ac_admin', password: 'TestPass@123' }),
    ]);

    reviewer1Token = r1.body.data.token;
    reviewer2Token = r2.body.data.token;
    adminToken = ad.body.data.token;
  });

  afterAll(async () => {
    await prisma.document.deleteMany({ where: { id: reviewer1DocId } });
    await prisma.user.deleteMany({ where: { username: { startsWith: 'ac_' } } });
    await prisma.$disconnect();
  });

  // Test 17: A user cannot access another user's restricted document
  it('should deny reviewer2 access to reviewer1\'s document', async () => {
    const res = await request(app)
      .get(`/api/documents/${reviewer1DocId}`)
      .set('Authorization', `Bearer ${reviewer2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test: Owner can access their own document
  it('should allow reviewer1 to access their own document', async () => {
    const res = await request(app)
      .get(`/api/documents/${reviewer1DocId}`)
      .set('Authorization', `Bearer ${reviewer1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.document.id).toBe(reviewer1DocId);
  });

  // Test: Admin can access any document
  it('should allow admin to access any document', async () => {
    const res = await request(app)
      .get(`/api/documents/${reviewer1DocId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.document.id).toBe(reviewer1DocId);
  });

  // Test 18: Unauthorized access to audit logs is denied
  it('should deny non-admin access to audit logs', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${reviewer1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin to access audit logs', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // Test: Non-existent document returns 404 not 403 to prevent info leak
  it('should return 404 for non-existent document', async () => {
    const res = await request(app)
      .get('/api/documents/nonexistent-id-12345')
      .set('Authorization', `Bearer ${reviewer1Token}`);

    expect(res.status).toBe(404);
  });

  // Test 20: Malformed input is rejected safely
  it('should reject malformed JSON body gracefully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"username": "test", invalid json}');

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
