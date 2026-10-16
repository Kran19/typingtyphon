/**
 * Typing Typhon — Key Analytics & Recommendation Contracts
 */

export type ConfidenceLevel = 'insufficient' | 'low' | 'moderate' | 'high';

export interface KeyMetricAggregate {
  key: string;
  totalAttempts: number;
  correctCount: number;
  errorCount: number;
  correctedCount: number; // Corrected with backspace
  accuracyPct: number;
  averageLatencyMs: number;
  sampleConfidence: ConfidenceLevel;
  lastPracticed?: string;
}

export type PracticeRecommendationType =
  | 'accuracy_remedial'  // recurring error (accuracy < 90% with sufficient sample size >= 5)
  | 'speed_drill'        // high accuracy but slow latency (> 1.6x average)
  | 'next_curriculum'    // ready to advance to next unpassed lesson
  | 'maintenance'        // all stages passed, maintain touch typing rhythm
  | 'general_practice';  // cold start / first-use state (< 5 keystrokes)

export interface PracticeRecommendation {
  type: PracticeRecommendationType;
  title: string;
  reason: string;
  targetKeys: string[];
  suggestedLessonId?: string;
  suggestedDrillType?: 'intro' | 'word' | 'remedial';
  suggestedWords?: string[];
  confidence: 'insufficient_data' | 'confident';
}
