// Database seeding script — creates demo users with hashed passwords
// Run: npx ts-node src/utils/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with demo users...');

  const adminHash    = await bcrypt.hash('Admin@1234!', 12);
  const reviewerHash = await bcrypt.hash('Reviewer@1234!', 12);
  const readonlyHash = await bcrypt.hash('Readonly@1234!', 12);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username:     'admin',
      email:        'admin@legaldemo.local',
      passwordHash: adminHash,
      role:         'ADMIN',
      isActive:     true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'reviewer1' },
    update: {},
    create: {
      username:     'reviewer1',
      email:        'reviewer1@legaldemo.local',
      passwordHash: reviewerHash,
      role:         'LEGAL_REVIEWER',
      isActive:     true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'readonly1' },
    update: {},
    create: {
      username:     'readonly1',
      email:        'readonly1@legaldemo.local',
      passwordHash: readonlyHash,
      role:         'READ_ONLY',
      isActive:     true,
    },
  });

  console.log('');
  console.log('Demo users created:');
  console.log('  admin     / Admin@1234!       (ADMIN)');
  console.log('  reviewer1 / Reviewer@1234!    (LEGAL_REVIEWER)');
  console.log('  readonly1 / Readonly@1234!    (READ_ONLY)');
  console.log('');
  console.log('Change these credentials before any real use.');
}

main()
  .catch((e) => { console.error('Seeding failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
