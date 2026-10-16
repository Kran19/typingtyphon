import { SecondSnapshot, TestMode } from './engine';

export interface PerKeyStatDto {
  key: string;
  attempts: number;
  errors: number;
  avgLatencyMs: number;
  commonSubstitution?: string;
}

export interface CreateSessionDto {
  sessionType: 'speed_test' | 'lesson' | 'practice' | 'contest';
  durationSeconds: number;
  netWpm: number;
  grossWpm: number;
  accuracyPct: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  errorCount: number;
  mode: TestMode;
  textSeed?: string;
  timeSeries?: SecondSnapshot[];
  perKeyStats?: PerKeyStatDto[];
  clientTimestamp: string;
}

export interface GuestSessionMigrationItem extends CreateSessionDto {
  localId: string;
  isMigrated: boolean;
  dedupHash: string; // SHA-256 of timestamp + duration + netWpm + mode
}

export interface GuestSessionMigrationDto {
  guestSessions: GuestSessionMigrationItem[];
}

export interface MigrationResultDto {
  migratedCount: number;
  skippedCount: number;
  duplicateCount: number;
  migratedIds: string[];
}

export interface UserProgressSummaryDto {
  totalCompletedTests: number;
  totalPracticeTimeSeconds: number;
  bestNetWpm: number;
  averageNetWpm: number;
  bestAccuracyPct: number;
  averageAccuracyPct: number;
  currentStreakDays: number;
  lastTestDate?: string;
}
