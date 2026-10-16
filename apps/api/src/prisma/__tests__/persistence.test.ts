import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

describe('PostgreSQL & Prisma Persistence Integration Tests', () => {
  let prisma: PrismaClient;
  const testEmail = `test_${Date.now()}@example.com`;
  const testUsername = `user_${Date.now()}`;
  let createdUserId: string;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://typhon_user:typhon_password_local_dev@localhost:5433/typingtyphon_dev?schema=public',
        },
      },
    });
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup test data
    if (createdUserId) {
      await prisma.typingSession.deleteMany({ where: { userId: createdUserId } });
      await prisma.user.delete({ where: { id: createdUserId } });
    }
    await prisma.$disconnect();
  });

  it('should successfully persist a user to PostgreSQL', async () => {
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        username: testUsername,
        passwordHash: 'dummy_hash_for_test',
        fullName: 'Test Typist',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.username).toBe(testUsername);
    expect(user.role).toBe('USER');
    expect(user.isEmailVerified).toBe(false);
    createdUserId = user.id;
  });

  it('should reject duplicate email with unique constraint violation', async () => {
    await expect(
      prisma.user.create({
        data: {
          email: testEmail, // duplicate
          username: `another_${Date.now()}`,
          passwordHash: 'hash',
        },
      })
    ).rejects.toThrow();
  });

  it('should persist a typing session linked to the user with dedupHash', async () => {
    const dedupHash = `hash_${Date.now()}_test`;
    const session = await prisma.typingSession.create({
      data: {
        userId: createdUserId,
        sessionType: 'speed_test',
        durationSeconds: 60,
        netWpm: 82.5,
        grossWpm: 85.0,
        accuracyPct: 97.1,
        totalKeystrokes: 425,
        correctKeystrokes: 412,
        errorCount: 3,
        mode: 'words',
        dedupHash,
        isGuestMigrated: false,
      },
    });

    expect(session.id).toBeDefined();
    expect(session.userId).toBe(createdUserId);
    expect(session.netWpm).toBe(82.5);
    expect(session.dedupHash).toBe(dedupHash);
  });

  it('should enforce unique constraint on dedupHash to guarantee idempotent migration', async () => {
    const dedupHash = `unique_hash_idempotent_${Date.now()}`;

    // First insert succeeds
    await prisma.typingSession.create({
      data: {
        userId: createdUserId,
        durationSeconds: 30,
        netWpm: 90.0,
        grossWpm: 90.0,
        accuracyPct: 100,
        totalKeystrokes: 225,
        correctKeystrokes: 225,
        errorCount: 0,
        dedupHash,
      },
    });

    // Attempting duplicate insert with identical dedupHash must fail
    await expect(
      prisma.typingSession.create({
        data: {
          userId: createdUserId,
          durationSeconds: 30,
          netWpm: 90.0,
          grossWpm: 90.0,
          accuracyPct: 100,
          totalKeystrokes: 225,
          correctKeystrokes: 225,
          errorCount: 0,
          dedupHash, // duplicate
        },
      })
    ).rejects.toThrow();
  });

  it('should retrieve a user with their associated typing sessions via relations', async () => {
    const userWithSessions = await prisma.user.findUnique({
      where: { id: createdUserId },
      include: { sessions: true },
    });

    expect(userWithSessions).not.toBeNull();
    expect(userWithSessions?.sessions.length).toBeGreaterThanOrEqual(2);
  });
});
