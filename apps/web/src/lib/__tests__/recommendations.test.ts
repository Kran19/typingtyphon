import { describe, it, expect } from 'vitest';
import { generatePracticeRecommendation } from '../recommendations';
import { ALL_CURRICULUM_STAGES, KeyMetricAggregate } from '@typingtyphon/contracts';
import { LessonProgress } from '../storage';

describe('Personalized Practice Recommendation Engine', () => {
  it('should recommend general practice / Stage 1 Lesson 1 when key data is empty (Cold Start)', () => {
    const rec = generatePracticeRecommendation({}, {});
    expect(rec.type).toBe('general_practice');
    expect(rec.confidence).toBe('insufficient_data');
    expect(rec.suggestedLessonId).toBe('lesson-1-1');
    expect(rec.suggestedDrillType).toBe('intro');
  });

  it('should ignore keys with insufficient sample size (< 5 attempts) when checking for weaknesses', () => {
    const keyAnalytics: Record<string, KeyMetricAggregate> = {
      e: {
        key: 'e',
        totalAttempts: 3, // < 5 attempts
        correctCount: 1,
        errorCount: 2,
        correctedCount: 1,
        accuracyPct: 33.3,
        averageLatencyMs: 200,
        sampleConfidence: 'insufficient',
      },
    };

    const rec = generatePracticeRecommendation(keyAnalytics, {});
    // Should NOT label 'e' as a weakness because sample size is insufficient!
    expect(rec.type).toBe('general_practice');
    expect(rec.confidence).toBe('insufficient_data');
  });

  it('should recommend remedial drill when a key has recurring errors (accuracy < 90% and errorCount >= 2 with >= 5 attempts)', () => {
    const keyAnalytics: Record<string, KeyMetricAggregate> = {
      f: {
        key: 'f',
        totalAttempts: 20,
        correctCount: 19,
        errorCount: 1,
        correctedCount: 0,
        accuracyPct: 95.0,
        averageLatencyMs: 180,
        sampleConfidence: 'moderate',
      },
      e: {
        key: 'e',
        totalAttempts: 12,
        correctCount: 8,
        errorCount: 4,
        correctedCount: 3,
        accuracyPct: 66.7,
        averageLatencyMs: 220,
        sampleConfidence: 'low',
      },
    };

    const rec = generatePracticeRecommendation(keyAnalytics, {});
    expect(rec.type).toBe('accuracy_remedial');
    expect(rec.confidence).toBe('confident');
    expect(rec.targetKeys).toContain('e');
    expect(rec.suggestedLessonId).toBe('lesson-3-1'); // Lesson 3.1 teaches E and I
    expect(rec.suggestedDrillType).toBe('remedial');
    expect(rec.reason).toContain("accuracy of 66.7% with 4 errors on key 'E'");
  });

  it('should recommend speed & rhythm drill when accuracy is high but latency indicates hesitation', () => {
    const keyAnalytics: Record<string, KeyMetricAggregate> = {
      f: {
        key: 'f',
        totalAttempts: 30,
        correctCount: 29,
        errorCount: 1,
        correctedCount: 0,
        accuracyPct: 96.7,
        averageLatencyMs: 150,
        sampleConfidence: 'high',
      },
      j: {
        key: 'j',
        totalAttempts: 30,
        correctCount: 30,
        errorCount: 0,
        correctedCount: 0,
        accuracyPct: 100.0,
        averageLatencyMs: 160,
        sampleConfidence: 'high',
      },
      p: {
        key: 'p',
        totalAttempts: 25,
        correctCount: 24,
        errorCount: 1,
        correctedCount: 0,
        accuracyPct: 96.0, // High accuracy
        averageLatencyMs: 420, // > 1.6x average (155ms) and > 250ms
        sampleConfidence: 'moderate',
      },
    };

    const rec = generatePracticeRecommendation(keyAnalytics, {});
    expect(rec.type).toBe('speed_drill');
    expect(rec.confidence).toBe('confident');
    expect(rec.targetKeys).toContain('p');
    expect(rec.suggestedLessonId).toBe('lesson-3-4'); // Lesson 3.4 teaches P
    expect(rec.suggestedDrillType).toBe('word');
  });

  it('should recommend next unpassed curriculum lesson when key telemetry is strong', () => {
    const keyAnalytics: Record<string, KeyMetricAggregate> = {
      f: {
        key: 'f',
        totalAttempts: 25,
        correctCount: 25,
        errorCount: 0,
        correctedCount: 0,
        accuracyPct: 100.0,
        averageLatencyMs: 180,
        sampleConfidence: 'moderate',
      },
      j: {
        key: 'j',
        totalAttempts: 25,
        correctCount: 24,
        errorCount: 1,
        correctedCount: 1,
        accuracyPct: 96.0,
        averageLatencyMs: 190,
        sampleConfidence: 'moderate',
      },
    };

    // User passed lesson-1-1
    const progress: Record<string, LessonProgress> = {
      'lesson-1-1': {
        lessonId: 'lesson-1-1',
        bestAccuracyPct: 98.0,
        bestNetWpm: 22.0,
        passed: true,
        attemptsCount: 2,
        lastAttemptDate: new Date().toISOString(),
      },
    };

    const rec = generatePracticeRecommendation(keyAnalytics, progress);
    expect(rec.type).toBe('next_curriculum');
    expect(rec.confidence).toBe('confident');
    expect(rec.suggestedLessonId).toBe('lesson-1-2'); // Next lesson in Stage 1
    expect(rec.suggestedDrillType).toBe('intro');
  });

  it('should recommend maintenance practice when all 6 curriculum stages are completely passed', () => {
    const keyAnalytics: Record<string, KeyMetricAggregate> = {
      f: {
        key: 'f',
        totalAttempts: 50,
        correctCount: 49,
        errorCount: 1,
        correctedCount: 0,
        accuracyPct: 98.0,
        averageLatencyMs: 160,
        sampleConfidence: 'high',
      },
    };

    // Mark every lesson across all 6 stages as passed
    const progress: Record<string, LessonProgress> = {};
    for (const stage of ALL_CURRICULUM_STAGES) {
      for (const lesson of stage.lessons) {
        progress[lesson.id] = {
          lessonId: lesson.id,
          bestAccuracyPct: 98.0,
          bestNetWpm: 30.0,
          passed: true,
          attemptsCount: 1,
          lastAttemptDate: new Date().toISOString(),
        };
      }
    }

    const rec = generatePracticeRecommendation(keyAnalytics, progress);
    expect(rec.type).toBe('maintenance');
    expect(rec.confidence).toBe('confident');
    expect(rec.title).toContain('Full Curriculum Mastered');
  });

  it('should prioritize accuracy remediation over speed hesitation when metrics conflict', () => {
    // Conflicting metrics: 'e' has accuracy deficit, while 'p' has latency hesitation
    const keyAnalytics: Record<string, KeyMetricAggregate> = {
      f: {
        key: 'f',
        totalAttempts: 30,
        correctCount: 30,
        errorCount: 0,
        correctedCount: 0,
        accuracyPct: 100.0,
        averageLatencyMs: 150,
        sampleConfidence: 'high',
      },
      e: {
        key: 'e',
        totalAttempts: 15,
        correctCount: 11,
        errorCount: 4, // Accuracy deficit: 73.3%
        correctedCount: 2,
        accuracyPct: 73.3,
        averageLatencyMs: 190,
        sampleConfidence: 'moderate',
      },
      p: {
        key: 'p',
        totalAttempts: 20,
        correctCount: 20,
        errorCount: 0,
        correctedCount: 0,
        accuracyPct: 100.0,
        averageLatencyMs: 400, // Latency hesitation: 400ms vs ~170ms mean
        sampleConfidence: 'moderate',
      },
    };

    const rec = generatePracticeRecommendation(keyAnalytics, {});
    // Accuracy ALWAYS takes priority over speed drill
    expect(rec.type).toBe('accuracy_remedial');
    expect(rec.targetKeys).toContain('e');
    expect(rec.targetKeys).not.toContain('p');
  });

  it('should advance to next curriculum lesson when recent sessions improve key accuracy above 90%', () => {
    // User previously had errors, but now has 28 correct out of 30 attempts (93.3% accuracy)
    const keyAnalytics: Record<string, KeyMetricAggregate> = {
      f: {
        key: 'f',
        totalAttempts: 30,
        correctCount: 30,
        errorCount: 0,
        correctedCount: 0,
        accuracyPct: 100.0,
        averageLatencyMs: 160,
        sampleConfidence: 'high',
      },
      j: {
        key: 'j',
        totalAttempts: 30,
        correctCount: 28,
        errorCount: 2,
        correctedCount: 2,
        accuracyPct: 93.3, // Above 90% threshold -> no longer flagged as weak!
        averageLatencyMs: 170,
        sampleConfidence: 'high',
      },
    };

    const progress: Record<string, LessonProgress> = {
      'lesson-1-1': {
        lessonId: 'lesson-1-1',
        bestAccuracyPct: 96.0,
        bestNetWpm: 20.0,
        passed: true,
        attemptsCount: 3,
        lastAttemptDate: new Date().toISOString(),
      },
    };

    const rec = generatePracticeRecommendation(keyAnalytics, progress);
    // Since accuracy is >= 90% and latency is within normal range, advance to next lesson
    expect(rec.type).toBe('next_curriculum');
    expect(rec.suggestedLessonId).toBe('lesson-1-2');
  });
});
