import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../auth.service';
import { ProgressService } from '../../progress/progress.service';
import { RegisterDto, LoginDto, GuestSessionMigrationItem } from '@typingtyphon/contracts';

describe('Auth & Idempotent Guest Migration Tests', () => {
  let prisma: PrismaClient;
  let authService: AuthService;
  let progressService: ProgressService;

  const testEmail = `auth_test_${Date.now()}@example.com`;
  const testUsername = `typist_${Date.now()}`;
  const testPassword = 'Password123!Secure';
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
    authService = new AuthService(prisma as any);
    progressService = new ProgressService(prisma as any);
  });

  afterAll(async () => {
    if (createdUserId) {
      await prisma.typingSession.deleteMany({ where: { userId: createdUserId } });
      await prisma.user.delete({ where: { id: createdUserId } });
    }
    await prisma.$disconnect();
  });

  describe('Phase C: Authentication', () => {
    it('should register a new user and return user profile and tokens', async () => {
      const dto: RegisterDto = {
        email: testEmail,
        username: testUsername,
        password: testPassword,
        fullName: 'Speedy Typhon',
      };

      const result = await authService.register(dto);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testEmail.toLowerCase());
      expect(result.user.username).toBe(testUsername);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      createdUserId = result.user.id;
    });

    it('should reject registration with duplicate email with ConflictException', async () => {
      const duplicateDto: RegisterDto = {
        email: testEmail, // same email
        username: `diff_${Date.now()}`,
        password: testPassword,
      };

      await expect(authService.register(duplicateDto)).rejects.toThrow();
    });

    it('should log in an existing user with correct credentials', async () => {
      const loginDto: LoginDto = {
        email: testEmail,
        password: testPassword,
      };

      const result = await authService.login(loginDto);
      expect(result.user.id).toBe(createdUserId);
      expect(result.accessToken).toBeDefined();

      // Verify token authenticity
      const payload = authService.verifyToken(result.accessToken);
      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe(createdUserId);
    });

    it('should reject login with invalid password with UnauthorizedException', async () => {
      const invalidDto: LoginDto = {
        email: testEmail,
        password: 'WrongPassword!',
      };

      await expect(authService.login(invalidDto)).rejects.toThrow();
    });
  });

  describe('Phase D: Idempotent Guest History Migration', () => {
    const mockGuestSession1: GuestSessionMigrationItem = {
      localId: `loc_${Date.now()}_1`,
      sessionType: 'speed_test',
      durationSeconds: 60,
      netWpm: 78.5,
      grossWpm: 80.0,
      accuracyPct: 98.1,
      totalKeystrokes: 395,
      correctKeystrokes: 388,
      errorCount: 2,
      mode: 'words',
      clientTimestamp: '2026-10-16T12:00:00.000Z',
      isMigrated: false,
      dedupHash: `dedup_${Date.now()}_alpha`,
    };

    const mockGuestSession2: GuestSessionMigrationItem = {
      localId: `loc_${Date.now()}_2`,
      sessionType: 'speed_test',
      durationSeconds: 30,
      netWpm: 92.0,
      grossWpm: 92.0,
      accuracyPct: 100,
      totalKeystrokes: 230,
      correctKeystrokes: 230,
      errorCount: 0,
      mode: 'words',
      clientTimestamp: '2026-10-16T12:05:00.000Z',
      isMigrated: false,
      dedupHash: `dedup_${Date.now()}_beta`,
    };

    const invalidSession: GuestSessionMigrationItem = {
      localId: `loc_${Date.now()}_invalid`,
      sessionType: 'speed_test',
      durationSeconds: 60,
      netWpm: 999.0, // physically impossible (exceeds 280)
      grossWpm: 999.0,
      accuracyPct: 100,
      totalKeystrokes: 5000,
      correctKeystrokes: 5000,
      errorCount: 0,
      mode: 'words',
      clientTimestamp: '2026-10-16T12:10:00.000Z',
      isMigrated: false,
      dedupHash: `dedup_${Date.now()}_invalid`,
    };

    it('should migrate valid guest sessions into user account and filter out implausible records', async () => {
      const migrationDto = {
        guestSessions: [mockGuestSession1, mockGuestSession2, invalidSession],
      };

      const result = await progressService.migrateGuestHistory(migrationDto, createdUserId);

      // 2 valid sessions imported, 1 invalid skipped
      expect(result.migratedCount).toBe(2);
      expect(result.skippedCount).toBe(1);
      expect(result.duplicateCount).toBe(0);
      expect(result.migratedIds).toContain(mockGuestSession1.localId);
      expect(result.migratedIds).toContain(mockGuestSession2.localId);

      // Verify sessions in PostgreSQL
      const userSessions = await progressService.getUserHistory(createdUserId);
      expect(userSessions.length).toBeGreaterThanOrEqual(2);
      const migrated = userSessions.filter((s) => s.isGuestMigrated);
      expect(migrated.length).toBe(2);
    });

    it('should be completely idempotent when client retries migration submission', async () => {
      // Re-submitting the same batch must not throw and must not duplicate records
      const retryDto = {
        guestSessions: [mockGuestSession1, mockGuestSession2],
      };

      const result = await progressService.migrateGuestHistory(retryDto, createdUserId);

      // Both are detected as duplicates via dedupHash
      expect(result.migratedCount).toBe(0);
      expect(result.duplicateCount).toBe(2);
      expect(result.skippedCount).toBe(0);
      expect(result.migratedIds).toContain(mockGuestSession1.localId);
      expect(result.migratedIds).toContain(mockGuestSession2.localId);
    });

    it('should calculate accurate user progress summary from migrated history', async () => {
      const summary = await progressService.getUserProgressSummary(createdUserId);
      expect(summary.totalCompletedTests).toBe(2);
      expect(summary.bestNetWpm).toBe(92.0);
      expect(summary.averageNetWpm).toBe(85.3); // (78.5 + 92.0) / 2 = 85.25 -> 85.3
    });

    it('should handle duplicate records inside a single batch request safely (intra-batch deduplication)', async () => {
      const uniqueHash = `intra_batch_${Date.now()}`;
      const duplicateWithinBatch: GuestSessionMigrationItem = {
        localId: `loc_intra_1`,
        sessionType: 'speed_test',
        durationSeconds: 60,
        netWpm: 65.0,
        grossWpm: 65.0,
        accuracyPct: 98.0,
        totalKeystrokes: 325,
        correctKeystrokes: 320,
        errorCount: 1,
        mode: 'words',
        clientTimestamp: '2026-10-16T12:20:00.000Z',
        isMigrated: false,
        dedupHash: uniqueHash,
      };

      const secondWithSameHash: GuestSessionMigrationItem = {
        ...duplicateWithinBatch,
        localId: `loc_intra_2`, // same dedupHash
      };

      const result = await progressService.migrateGuestHistory(
        { guestSessions: [duplicateWithinBatch, secondWithSameHash] },
        createdUserId
      );

      // First one migrated, second identified as duplicate
      expect(result.migratedCount).toBe(1);
      expect(result.duplicateCount).toBe(1);
      expect(result.skippedCount).toBe(0);
      expect(result.migratedIds).toContain('loc_intra_1');
      expect(result.migratedIds).toContain('loc_intra_2');
    });

    it('should filter out malformed records containing negative values, NaN, or invalid types', async () => {
      const malformedBatch: any[] = [
        {
          localId: 'bad_1',
          durationSeconds: -30, // negative duration
          netWpm: 50,
          accuracyPct: 95,
          dedupHash: `bad_hash_1_${Date.now()}`,
        },
        {
          localId: 'bad_2',
          durationSeconds: 60,
          netWpm: NaN, // NaN
          accuracyPct: 95,
          dedupHash: `bad_hash_2_${Date.now()}`,
        },
        {
          localId: 'bad_3',
          durationSeconds: 60,
          netWpm: 70,
          accuracyPct: 105, // > 100%
          dedupHash: `bad_hash_3_${Date.now()}`,
        },
        null,
        'not-an-object',
      ];

      const result = await progressService.migrateGuestHistory(
        { guestSessions: malformedBatch },
        createdUserId
      );

      expect(result.migratedCount).toBe(0);
      expect(result.skippedCount).toBe(5);
    });

    it('should enforce strict user isolation (no cross-user session leakage)', async () => {
      const secondUserEmail = `second_user_${Date.now()}@example.com`;
      const secondUser = await authService.register({
        email: secondUserEmail,
        username: `user2_${Date.now()}`,
        password: 'Password123!Secure',
      });

      const historyUser2 = await progressService.getUserHistory(secondUser.user.id);
      expect(historyUser2.length).toBe(0);

      // Verify that createdUserId's sessions do NOT appear in secondUser's history
      const createdUserSessions = await progressService.getUserHistory(createdUserId);
      expect(createdUserSessions.length).toBeGreaterThan(0);
      for (const s of createdUserSessions) {
        expect(s.userId).toBe(createdUserId);
        expect(s.userId).not.toBe(secondUser.user.id);
      }

      // Cleanup second user
      await prisma.user.delete({ where: { id: secondUser.user.id } });
    });

    it('should rotate refresh tokens and reject expired or revoked refresh tokens', async () => {
      // 1. Initial login to get tokens
      const loginRes = await authService.login({
        email: testEmail,
        password: testPassword,
      });

      const initialRefreshToken = loginRes.refreshToken;

      // 2. Refresh token rotation: exchange old refresh token for new pair
      const rotated = await authService.refreshTokens(initialRefreshToken);
      expect(rotated.accessToken).toBeDefined();
      expect(rotated.refreshToken).toBeDefined();
      expect(rotated.refreshToken).not.toBe(initialRefreshToken);

      // 3. Reuse detection: old refresh token must be rejected
      await expect(authService.refreshTokens(initialRefreshToken)).rejects.toThrow();

      // 4. Token revocation on logout: revoke current session
      await authService.revokeUserTokens(createdUserId);
      await expect(authService.refreshTokens(rotated.refreshToken)).rejects.toThrow();
    });

    it('should rigorously evaluate all metric boundaries in evaluatePlausibility', () => {
      // 1. Normal human speeds (<= 220 WPM)
      expect(progressService.evaluatePlausibility(60, 98, 60).status).toBe('NORMAL');
      expect(progressService.evaluatePlausibility(220, 100, 30).status).toBe('NORMAL');

      // 2. Suspicious high speeds (220 < netWpm <= 280 WPM)
      const susp = progressService.evaluatePlausibility(221, 99, 15);
      expect(susp.status).toBe('SUSPICIOUS_HIGH');
      expect(susp.isFlagged).toBe(true);

      const bound280 = progressService.evaluatePlausibility(280, 98, 15);
      expect(bound280.status).toBe('SUSPICIOUS_HIGH');
      expect(bound280.isFlagged).toBe(true);

      // 3. Extreme outliers / Scripted macros (280 < netWpm <= 350 WPM)
      const extreme = progressService.evaluatePlausibility(281, 100, 30);
      expect(extreme.status).toBe('EXTREME_OUTLIER');
      expect(extreme.isFlagged).toBe(true);

      const bound350 = progressService.evaluatePlausibility(350, 95, 60);
      expect(bound350.status).toBe('EXTREME_OUTLIER');
      expect(bound350.isFlagged).toBe(true);

      // 4. Invalid / corrupt inputs (< 0, > 350, NaN, duration <= 0, acc > 100%)
      expect(progressService.evaluatePlausibility(351, 95, 60).status).toBe('INVALID');
      expect(progressService.evaluatePlausibility(-10, 95, 60).status).toBe('INVALID');
      expect(progressService.evaluatePlausibility(NaN, 95, 60).status).toBe('INVALID');
      expect(progressService.evaluatePlausibility(80, 101, 60).status).toBe('INVALID');
      expect(progressService.evaluatePlausibility(80, -5, 60).status).toBe('INVALID');
      expect(progressService.evaluatePlausibility(80, 95, 0).status).toBe('INVALID');
      expect(progressService.evaluatePlausibility(80, 95, -10).status).toBe('INVALID');
    });
  });
});

