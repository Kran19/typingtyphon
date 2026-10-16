import { describe, it, expect } from 'vitest';
import { ALL_CURRICULUM_STAGES, CurriculumLesson } from '@typingtyphon/contracts';

describe('Curriculum Architecture & Progression Tests (Stages 1–6)', () => {
  it('should contain all 6 stages in sequential order', () => {
    expect(ALL_CURRICULUM_STAGES.length).toBe(6);
    for (let i = 0; i < ALL_CURRICULUM_STAGES.length; i++) {
      expect(ALL_CURRICULUM_STAGES[i].stageNumber).toBe(i + 1);
      expect(ALL_CURRICULUM_STAGES[i].lessons.length).toBeGreaterThan(0);
      expect(ALL_CURRICULUM_STAGES[i].title).toBeDefined();
      expect(ALL_CURRICULUM_STAGES[i].slug).toBeDefined();
      expect(ALL_CURRICULUM_STAGES[i].targetKeys.length).toBeGreaterThan(0);
    }
  });

  it('should assign unique, stable IDs to every lesson across all stages', () => {
    const allLessonIds = new Set<string>();
    let totalLessonsCount = 0;

    for (const stage of ALL_CURRICULUM_STAGES) {
      for (const lesson of stage.lessons) {
        expect(allLessonIds.has(lesson.id)).toBe(false);
        allLessonIds.add(lesson.id);
        totalLessonsCount++;

        // ID must match pattern lesson-{stage}-{lessonNum}
        expect(lesson.id).toMatch(/^lesson-\d+-\d+$/);
      }
    }

    expect(allLessonIds.size).toBe(totalLessonsCount);
    // 5 in Stage 1 + 2 in Stage 2 + 5 in Stage 3 + 6 in Stage 4 + 3 in Stage 5 + 4 in Stage 6 = 25 lessons
    expect(totalLessonsCount).toBe(25);
  });

  it('should specify explicit learning objectives and pass thresholds for every lesson', () => {
    for (const stage of ALL_CURRICULUM_STAGES) {
      for (const lesson of stage.lessons) {
        expect(lesson.learningObjective).toBeDefined();
        expect(lesson.learningObjective!.length).toBeGreaterThan(10);
        expect(lesson.passThreshold.minAccuracyPct).toBeGreaterThanOrEqual(95.0);
        expect(lesson.passThreshold.minAccuracyPct).toBeLessThanOrEqual(100.0);
        expect(lesson.passThreshold.minWpm).toBeGreaterThanOrEqual(15.0);
        expect(lesson.passThreshold.minWpm).toBeLessThanOrEqual(30.0);
      }
    }
  });

  it('should have valid non-empty intro, word, and remedial drills for each lesson', () => {
    for (const stage of ALL_CURRICULUM_STAGES) {
      for (const lesson of stage.lessons) {
        expect(lesson.introDrill.length).toBeGreaterThan(0);
        expect(lesson.wordDrill.length).toBeGreaterThan(0);
        expect(lesson.remedialDrill.length).toBeGreaterThan(0);
      }
    }
  });

  it('should enforce strict, non-circular prerequisite ordering', () => {
    const passedSoFar = new Set<string>();

    for (const stage of ALL_CURRICULUM_STAGES) {
      for (const lesson of stage.lessons) {
        const prereqs = lesson.prerequisiteLessonIds || [];
        // All prerequisites must already exist in earlier lessons (no forward references or cycles)
        for (const pId of prereqs) {
          expect(passedSoFar.has(pId)).toBe(true);
        }
        passedSoFar.add(lesson.id);
      }
    }
  });

  it('should map target keys to valid anatomical finger assignments', () => {
    const validFingers = new Set([
      'left-pinky',
      'left-ring',
      'left-middle',
      'left-index',
      'thumb',
      'right-index',
      'right-middle',
      'right-ring',
      'right-pinky',
    ]);

    for (const stage of ALL_CURRICULUM_STAGES) {
      for (const lesson of stage.lessons) {
        for (const [key, finger] of Object.entries(lesson.targetFingers)) {
          expect(validFingers.has(finger)).toBe(true);
        }
      }
    }
  });

  it('should only use taught characters in drills across Stages 1–4', () => {
    const taughtChars = new Set<string>([' ']);

    for (const stage of ALL_CURRICULUM_STAGES) {
      if (stage.stageNumber > 4) break; // Stages 5 & 6 intentionally introduce numbers and shift symbols

      for (const lesson of stage.lessons) {
        // Add new target keys
        for (const k of lesson.targetKeys) {
          taughtChars.add(k.toLowerCase());
        }

        const allDrillWords = [
          ...lesson.introDrill,
          ...lesson.wordDrill,
          ...lesson.remedialDrill,
        ];

        for (const token of allDrillWords) {
          for (const char of token.toLowerCase()) {
            expect(
              taughtChars.has(char),
              `Lesson ${lesson.id} contains untaught char '${char}' in word '${token}'`
            ).toBe(true);
          }
        }
      }
    }
  });

  it('should unlock only initial lessons for new guests and require prerequisites for subsequent lessons', async () => {
    const { isLessonUnlocked, getMissingPrerequisites, findLessonById } = await import('@typingtyphon/contracts');

    // New visitor with zero completed lessons
    const emptyProgress: Record<string, { passed?: boolean }> = {};

    const lesson1_1 = ALL_CURRICULUM_STAGES[0].lessons[0];
    const lesson1_2 = ALL_CURRICULUM_STAGES[0].lessons[1];
    const lesson2_1 = ALL_CURRICULUM_STAGES[1].lessons[0];

    // Lesson 1.1 must be unlocked for guests
    expect(isLessonUnlocked(lesson1_1, emptyProgress)).toBe(true);
    expect(getMissingPrerequisites(lesson1_1, emptyProgress)).toEqual([]);

    // Lesson 1.2 must be locked
    expect(isLessonUnlocked(lesson1_2, emptyProgress)).toBe(false);
    expect(getMissingPrerequisites(lesson1_2, emptyProgress)).toEqual(['lesson-1-1']);

    // Lesson 2.1 must be locked
    expect(isLessonUnlocked(lesson2_1, emptyProgress)).toBe(false);

    // Finding prerequisite lesson metadata
    const prereqFound = findLessonById('lesson-1-1');
    expect(prereqFound).not.toBeNull();
    expect(prereqFound?.lesson.title).toContain('Keys F and J');
    expect(prereqFound?.stage.stageNumber).toBe(1);
  });

  it('should unlock subsequent lessons when prerequisite lessons are passed', async () => {
    const { isLessonUnlocked } = await import('@typingtyphon/contracts');

    const progress: Record<string, { passed?: boolean }> = {
      'lesson-1-1': { passed: true },
    };

    const lesson1_2 = ALL_CURRICULUM_STAGES[0].lessons[1];
    const lesson1_3 = ALL_CURRICULUM_STAGES[0].lessons[2];

    // Lesson 1.2 is now unlocked
    expect(isLessonUnlocked(lesson1_2, progress)).toBe(true);
    // Lesson 1.3 remains locked until 1.2 passes
    expect(isLessonUnlocked(lesson1_3, progress)).toBe(false);

    // Failed attempt on 1.2 does not unlock 1.3
    progress['lesson-1-2'] = { passed: false };
    expect(isLessonUnlocked(lesson1_3, progress)).toBe(false);

    // Passed attempt on 1.2 unlocks 1.3
    progress['lesson-1-2'] = { passed: true };
    expect(isLessonUnlocked(lesson1_3, progress)).toBe(true);
  });

  it('should verify all 75 drills contain well-formed, non-empty, trimmed exercise strings', () => {
    let drillCount = 0;
    for (const stage of ALL_CURRICULUM_STAGES) {
      for (const lesson of stage.lessons) {
        const drills = [
          { name: 'intro', words: lesson.introDrill },
          { name: 'word', words: lesson.wordDrill },
          { name: 'remedial', words: lesson.remedialDrill },
        ];

        for (const drill of drills) {
          drillCount++;
          expect(drill.words.length).toBeGreaterThanOrEqual(2);
          for (const item of drill.words) {
            expect(typeof item).toBe('string');
            expect(item.length).toBeGreaterThan(0);
            expect(item.trim()).toBe(item); // No trailing or leading unformatted spaces
          }
        }
      }
    }
    // 25 lessons * 3 drills = 75 drills
    expect(drillCount).toBe(75);
  });
});
