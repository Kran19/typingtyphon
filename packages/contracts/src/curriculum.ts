/**
 * Typing Typhon — Curriculum Schema & Types
 */

export type FingerAssignment =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export interface LessonPassThreshold {
  minAccuracyPct: number;
  minWpm: number;
}

export interface CurriculumLesson {
  id: string;
  stageNumber: number;
  stageSlug: string;
  title: string;
  description: string;
  learningObjective?: string;
  targetKeys: string[];
  targetFingers: Record<string, FingerAssignment>;
  introDrill: string[];
  wordDrill: string[];
  remedialDrill: string[];
  passThreshold: LessonPassThreshold;
  prerequisiteLessonIds?: string[];
}

export interface CurriculumStage {
  stageNumber: number;
  slug: string;
  title: string;
  description: string;
  targetKeys: string[];
  lessons: CurriculumLesson[];
}

export interface LessonAttemptResult {
  lessonId: string;
  accuracyPct: number;
  netWpm: number;
  passed: boolean;
  needsRemedial: boolean;
  timeSpentSeconds: number;
}
