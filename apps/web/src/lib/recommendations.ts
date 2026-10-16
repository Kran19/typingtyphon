import {
  ALL_CURRICULUM_STAGES,
  CurriculumStage,
  CurriculumLesson,
  KeyMetricAggregate,
  PracticeRecommendation,
} from '@typingtyphon/contracts';
import { LessonProgress } from './storage';

/**
 * Deterministic recommendation engine for personalized touch typing practice.
 * Strictly rule-based, transparent, and reproducible with zero external LLM dependencies.
 */
export function generatePracticeRecommendation(
  keyAnalytics: Record<string, KeyMetricAggregate> = {},
  curriculumProgress: Record<string, LessonProgress> = {},
  stages: CurriculumStage[] = ALL_CURRICULUM_STAGES
): PracticeRecommendation {
  const metricValues = Object.values(keyAnalytics);
  const confidentKeys = metricValues.filter((k) => k.sampleConfidence !== 'insufficient');

  // Helper to locate which lesson teaches a specific target key
  function findLessonForTargetKey(key: string): { stage: CurriculumStage; lesson: CurriculumLesson } | null {
    const lowerKey = key.toLowerCase();
    for (const stage of stages) {
      for (const lesson of stage.lessons) {
        if (lesson.targetKeys.some((k) => k.toLowerCase() === lowerKey)) {
          return { stage, lesson };
        }
      }
    }
    // Fallback search across targetFingers keys
    for (const stage of stages) {
      for (const lesson of stage.lessons) {
        if (Object.keys(lesson.targetFingers).some((k) => k.toLowerCase() === lowerKey)) {
          return { stage, lesson };
        }
      }
    }
    return null;
  }

  // Helper to find the earliest unpassed lesson
  function findNextUnpassedLesson(): { stage: CurriculumStage; lesson: CurriculumLesson } | null {
    for (const stage of stages) {
      for (const lesson of stage.lessons) {
        const isPassed = !!curriculumProgress[lesson.id]?.passed;
        if (!isPassed) {
          // Check if prerequisites are satisfied
          const prereqs = lesson.prerequisiteLessonIds || [];
          const prereqsSatisfied = prereqs.every((pId) => !!curriculumProgress[pId]?.passed);
          if (prereqsSatisfied || prereqs.length === 0) {
            return { stage, lesson };
          }
        }
      }
    }
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. COLD START / INSUFFICIENT DATA
  // ─────────────────────────────────────────────────────────────────────────────
  if (confidentKeys.length === 0) {
    const nextLesson = findNextUnpassedLesson() || {
      stage: stages[0],
      lesson: stages[0].lessons[0],
    };

    return {
      type: 'general_practice',
      title: `Begin Stage ${nextLesson.stage.stageNumber}: ${nextLesson.lesson.title}`,
      reason:
        'Welcome! Insufficient keystroke data exists to identify individual weak keys yet (minimum 5 attempts required per key). Start with foundational home row practice.',
      targetKeys: nextLesson.lesson.targetKeys,
      suggestedLessonId: nextLesson.lesson.id,
      suggestedDrillType: 'intro',
      suggestedWords: nextLesson.lesson.introDrill,
      confidence: 'insufficient_data',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. ACCURACY REMEDIATION GATE (Recurring errors >= 2 and accuracy < 90%)
  // ─────────────────────────────────────────────────────────────────────────────
  const weakKeys = confidentKeys
    .filter((k) => k.accuracyPct < 90.0 && k.errorCount >= 2)
    .sort((a, b) => a.accuracyPct - b.accuracyPct || b.errorCount - a.errorCount);

  if (weakKeys.length > 0) {
    const primaryWeakKey = weakKeys[0];
    const match = findLessonForTargetKey(primaryWeakKey.key);

    const lesson = match ? match.lesson : stages[0].lessons[0];
    const words = lesson.remedialDrill.length > 0 ? lesson.remedialDrill : lesson.introDrill;

    return {
      type: 'accuracy_remedial',
      title: `Remedial Drill: Key '${primaryWeakKey.key.toUpperCase()}' Accuracy`,
      reason: `You have an accuracy of ${primaryWeakKey.accuracyPct}% with ${primaryWeakKey.errorCount} errors on key '${primaryWeakKey.key.toUpperCase()}' across ${primaryWeakKey.totalAttempts} attempts. Focus on precision before speed.`,
      targetKeys: [primaryWeakKey.key],
      suggestedLessonId: lesson.id,
      suggestedDrillType: 'remedial',
      suggestedWords: words,
      confidence: 'confident',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. SLOW-KEY RHYTHM & LATENCY DRILL
  // ─────────────────────────────────────────────────────────────────────────────
  const totalLatency = confidentKeys.reduce((sum, k) => sum + k.averageLatencyMs, 0);
  const meanLatency = totalLatency / confidentKeys.length;

  const slowKeys = confidentKeys
    .filter((k) => k.accuracyPct >= 90.0 && k.averageLatencyMs > 1.6 * meanLatency && k.averageLatencyMs > 250)
    .sort((a, b) => b.averageLatencyMs - a.averageLatencyMs);

  if (slowKeys.length > 0) {
    const primarySlowKey = slowKeys[0];
    const match = findLessonForTargetKey(primarySlowKey.key);
    const lesson = match ? match.lesson : stages[0].lessons[0];

    return {
      type: 'speed_drill',
      title: `Rhythm & Speed Drill: Key '${primarySlowKey.key.toUpperCase()}'`,
      reason: `Your accuracy on '${primarySlowKey.key.toUpperCase()}' is good (${primarySlowKey.accuracyPct}%), but your average latency (${primarySlowKey.averageLatencyMs}ms) indicates hesitation compared to your overall pace (${Math.round(meanLatency)}ms).`,
      targetKeys: [primarySlowKey.key],
      suggestedLessonId: lesson.id,
      suggestedDrillType: 'word',
      suggestedWords: lesson.wordDrill,
      confidence: 'confident',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. CURRICULUM PROGRESSION (Next unpassed lesson)
  // ─────────────────────────────────────────────────────────────────────────────
  const nextLesson = findNextUnpassedLesson();
  if (nextLesson) {
    return {
      type: 'next_curriculum',
      title: `Next Lesson: ${nextLesson.lesson.title}`,
      reason: `Your keystroke accuracy is stable! Advance to Stage ${nextLesson.stage.stageNumber}, Lesson: ${nextLesson.lesson.title} (${nextLesson.lesson.targetKeys.join(', ').toUpperCase()}) to expand your keyboard reach.`,
      targetKeys: nextLesson.lesson.targetKeys,
      suggestedLessonId: nextLesson.lesson.id,
      suggestedDrillType: 'intro',
      suggestedWords: nextLesson.lesson.introDrill,
      confidence: 'confident',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. FULL CURRICULUM MASTERY & SPEED MAINTENANCE
  // ─────────────────────────────────────────────────────────────────────────────
  return {
    type: 'maintenance',
    title: 'Full Curriculum Mastered! Speed & Rhythm Maintenance',
    reason:
      'Outstanding work! You have completed all 6 curriculum stages with high accuracy. Practice 60s timed speed tests or multi-row pangrams to maintain rhythm.',
    targetKeys: ['all'],
    suggestedDrillType: 'word',
    suggestedWords: stages[3].lessons[stages[3].lessons.length - 1].wordDrill,
    confidence: 'confident',
  };
}
