import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSessionDto,
  GuestSessionMigrationDto,
  MigrationResultDto,
  UserProgressSummaryDto,
} from '@typingtyphon/contracts';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submit a single typing session (supports both guests and authenticated users).
   */
  async submitSession(dto: CreateSessionDto, userId?: string) {
    this.validateSessionMetrics(dto);

    return this.prisma.typingSession.create({
      data: {
        userId: userId || null,
        sessionType: dto.sessionType || 'speed_test',
        durationSeconds: dto.durationSeconds,
        netWpm: dto.netWpm,
        grossWpm: dto.grossWpm,
        accuracyPct: dto.accuracyPct,
        totalKeystrokes: dto.totalKeystrokes,
        correctKeystrokes: dto.correctKeystrokes,
        errorCount: dto.errorCount,
        mode: dto.mode || 'words',
        textSeed: dto.textSeed || null,
        timeSeriesSummary: dto.timeSeries ? (dto.timeSeries as any) : undefined,
        isGuestMigrated: false,
        completedAt: dto.clientTimestamp ? new Date(dto.clientTimestamp) : new Date(),
      },
    });
  }

  /**
   * Safely and idempotently migrate local guest history into an authenticated user's account.
   */
  async migrateGuestHistory(dto: GuestSessionMigrationDto, userId: string): Promise<MigrationResultDto> {
    if (!dto.guestSessions || !Array.isArray(dto.guestSessions)) {
      throw new BadRequestException('Invalid payload: guestSessions must be an array.');
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let duplicateCount = 0;
    const migratedIds: string[] = [];
    const seenHashesInBatch = new Set<string>();

    for (const session of dto.guestSessions) {
      try {
        // 1. Plausibility Validation
        if (!this.isValidSession(session)) {
          skippedCount++;
          continue;
        }

        // 2. Intra-batch duplicate check
        if (session.dedupHash) {
          if (seenHashesInBatch.has(session.dedupHash)) {
            duplicateCount++;
            migratedIds.push(session.localId);
            continue;
          }
          seenHashesInBatch.add(session.dedupHash);

          // 3. Database unique constraint check for idempotent migration
          const existing = await this.prisma.typingSession.findUnique({
            where: { dedupHash: session.dedupHash },
          });

          if (existing) {
            duplicateCount++;
            migratedIds.push(session.localId);
            continue;
          }
        }

        // 3. Insert valid un-migrated record
        await this.prisma.typingSession.create({
          data: {
            userId,
            sessionType: session.sessionType || 'speed_test',
            durationSeconds: session.durationSeconds,
            netWpm: session.netWpm,
            grossWpm: session.grossWpm,
            accuracyPct: session.accuracyPct,
            totalKeystrokes: session.totalKeystrokes,
            correctKeystrokes: session.correctKeystrokes,
            errorCount: session.errorCount,
            mode: session.mode || 'words',
            dedupHash: session.dedupHash || undefined,
            timeSeriesSummary: session.timeSeries ? (session.timeSeries as any) : undefined,
            isGuestMigrated: true,
            completedAt: session.clientTimestamp ? new Date(session.clientTimestamp) : new Date(),
          },
        });

        migratedCount++;
        migratedIds.push(session.localId);
      } catch (err) {
        console.warn(`Error processing guest session migration [${session.localId}]:`, err);
        skippedCount++;
      }
    }

    return {
      migratedCount,
      skippedCount,
      duplicateCount,
      migratedIds,
    };
  }

  /**
   * Get user session history
   */
  async getUserHistory(userId: string, limit = 50) {
    return this.prisma.typingSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Compute aggregated statistics for authenticated user.
   */
  async getUserProgressSummary(userId: string): Promise<UserProgressSummaryDto> {
    const sessions = await this.prisma.typingSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });

    if (sessions.length === 0) {
      return {
        totalCompletedTests: 0,
        totalPracticeTimeSeconds: 0,
        bestNetWpm: 0,
        averageNetWpm: 0,
        bestAccuracyPct: 100,
        averageAccuracyPct: 100,
        currentStreakDays: 0,
      };
    }

    let totalPracticeTime = 0;
    let totalWpm = 0;
    let totalAcc = 0;
    let bestWpm = 0;
    let bestAcc = 0;

    for (const s of sessions) {
      totalPracticeTime += s.durationSeconds;
      totalWpm += s.netWpm;
      totalAcc += s.accuracyPct;
      if (s.netWpm > bestWpm) bestWpm = s.netWpm;
      if (s.accuracyPct > bestAcc) bestAcc = s.accuracyPct;
    }

    return {
      totalCompletedTests: sessions.length,
      totalPracticeTimeSeconds: totalPracticeTime,
      bestNetWpm: Number(bestWpm.toFixed(1)),
      averageNetWpm: Number((totalWpm / sessions.length).toFixed(1)),
      bestAccuracyPct: Number(bestAcc.toFixed(1)),
      averageAccuracyPct: Number((totalAcc / sessions.length).toFixed(1)),
      currentStreakDays: 1,
      lastTestDate: sessions[0].completedAt.toISOString(),
    };
  }

  /**
   * Evaluates session plausibility classification based on explicit metric boundaries:
   * - 'NORMAL': netWpm <= 220 WPM (standard human practice)
   * - 'SUSPICIOUS_HIGH': 220 < netWpm <= 280 WPM (human outlier, accepted into private stats, flagged for review)
   * - 'EXTREME_OUTLIER': 280 < netWpm <= 350 WPM (probable macro/chording, accepted into private history, barred from public leaderboards)
   * - 'INVALID': netWpm < 0, netWpm > 350, accuracy not 0-100%, or duration <= 0 (corrupt packet, rejected without penalty)
   */
  public evaluatePlausibility(netWpm: number, accuracyPct: number, durationSeconds: number): {
    status: 'NORMAL' | 'SUSPICIOUS_HIGH' | 'EXTREME_OUTLIER' | 'INVALID';
    isFlagged: boolean;
    flagReason?: string;
  } {
    if (
      typeof netWpm !== 'number' ||
      Number.isNaN(netWpm) ||
      netWpm < 0 ||
      netWpm > 350 ||
      typeof accuracyPct !== 'number' ||
      Number.isNaN(accuracyPct) ||
      accuracyPct < 0 ||
      accuracyPct > 100 ||
      typeof durationSeconds !== 'number' ||
      Number.isNaN(durationSeconds) ||
      durationSeconds <= 0
    ) {
      return { status: 'INVALID', isFlagged: false };
    }

    if (netWpm > 280) {
      return {
        status: 'EXTREME_OUTLIER',
        isFlagged: true,
        flagReason: 'EXTREME_OUTLIER_EXCEEDS_280_WPM',
      };
    }

    if (netWpm > 220) {
      return {
        status: 'SUSPICIOUS_HIGH',
        isFlagged: true,
        flagReason: 'SUSPICIOUS_HIGH_SPEED_EXCEEDS_220_WPM',
      };
    }

    return { status: 'NORMAL', isFlagged: false };
  }

  private isValidSession(session: any): boolean {
    if (!session || typeof session !== 'object') return false;
    const { status } = this.evaluatePlausibility(session.netWpm, session.accuracyPct, session.durationSeconds);
    return status !== 'INVALID';
  }

  private validateSessionMetrics(dto: CreateSessionDto): void {
    const { status } = this.evaluatePlausibility(dto.netWpm, dto.accuracyPct, dto.durationSeconds);
    if (status === 'INVALID') {
      throw new BadRequestException(
        'Invalid session telemetry: metrics out of valid bounds (netWpm 0-350, accuracy 0-100%, duration > 0).'
      );
    }
  }
}

