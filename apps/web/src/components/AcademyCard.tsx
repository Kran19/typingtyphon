'use client';

import React from 'react';
import {
  ALL_CURRICULUM_STAGES,
  CurriculumStage,
  CurriculumLesson,
} from '@typingtyphon/contracts';
import { LessonProgress } from '../lib/storage';

interface AcademyCardProps {
  progressMap: Record<string, LessonProgress>;
  onSelectDrill: (
    stage: CurriculumStage,
    lesson: CurriculumLesson,
    drillType: 'intro' | 'word' | 'remedial',
    words: string[]
  ) => void;
  activeDrillLessonId?: string | null;
  onExitDrill?: () => void;
  onOpenFullAcademy?: () => void;
}

export const AcademyCard: React.FC<AcademyCardProps> = ({
  progressMap,
  onSelectDrill,
  activeDrillLessonId,
  onExitDrill,
  onOpenFullAcademy,
}) => {
  // Compute total lessons and passed count
  const allLessons: { stage: CurriculumStage; lesson: CurriculumLesson }[] = [];
  for (const stage of ALL_CURRICULUM_STAGES) {
    for (const lesson of stage.lessons) {
      allLessons.push({ stage, lesson });
    }
  }

  const totalLessons = allLessons.length; // 25
  const passedCount = Object.values(progressMap).filter((p) => p.passed).length;

  // Find next active / uncompleted lesson
  const currentItem =
    allLessons.find((item) => !progressMap[item.lesson.id]?.passed) ||
    allLessons[0];

  const currentStage = currentItem.stage;
  const currentLesson = currentItem.lesson;
  const isCurrentDrillActive = activeDrillLessonId === currentLesson.id;

  // Target keys normalized to lowercase
  const targetKeysSet = new Set(currentLesson.targetKeys.map((k) => k.toLowerCase()));

  // Home row keyboard reference strip
  const homeRowKeys = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

  const handleStart = () => {
    onSelectDrill(
      currentStage,
      currentLesson,
      'intro',
      currentLesson.introDrill
    );
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1rem',
        padding: '1.5rem 1.65rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        position: 'relative',
      }}
    >
      {/* Top Tag & Stage Pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            background: 'rgba(14, 165, 233, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.28)',
            color: '#38bdf8',
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            fontWeight: 700,
          }}
        >
          TOUCH TYPING ACADEMY
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Stages 1–6 • {totalLessons} Lessons
        </span>
      </div>

      {/* Lesson Title & Passed Counter */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            {currentLesson.title.replace(/\s*\([^)]*\)/, '')}
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Stage {currentStage.stageNumber}: {currentStage.title}
          </div>
        </div>

        {/* Lessons Passed Badge */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.75rem',
            padding: '0.4rem 0.75rem',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {passedCount} / {totalLessons}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem', textTransform: 'uppercase' }}>
            Passed
          </div>
        </div>
      </div>

      {/* Lesson Description */}
      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
        {currentLesson.description}
      </p>

      {/* Key Preview Chips Row (Home Row Visual Reference) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        {homeRowKeys.map((k) => {
          const isTarget = targetKeysSet.has(k);
          return (
            <div
              key={k}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.825rem',
                textTransform: 'uppercase',
                background: isTarget ? 'var(--brand-primary)' : 'rgba(255, 255, 255, 0.04)',
                color: isTarget ? '#ffffff' : 'var(--text-muted)',
                border: isTarget ? '1px solid var(--brand-cyan)' : '1px solid var(--border-subtle)',
                boxShadow: isTarget ? '0 0 10px rgba(14, 165, 233, 0.4)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {k}
            </div>
          );
        })}
      </div>

      {/* Learning Benefits Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: '#10b981', fontWeight: 700 }}>✔</span>
          <span>Proper finger placement</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: '#10b981', fontWeight: 700 }}>✔</span>
          <span>Build neuromuscular muscle memory</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
        {isCurrentDrillActive ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div
              style={{
                flex: 1,
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '0.65rem',
                padding: '0.65rem 1rem',
                color: '#38bdf8',
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Drill in progress
            </div>
            {onExitDrill && (
              <button
                onClick={onExitDrill}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                ✕ Exit
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleStart}
            className="btn-primary"
            style={{ width: '100%', padding: '0.75rem 1.25rem' }}
          >
            <span>{passedCount > 0 ? 'Continue lesson' : 'Start lesson'}</span>
            <span style={{ fontSize: '1rem' }}>→</span>
          </button>
        )}

        {onOpenFullAcademy && (
          <button
            onClick={onOpenFullAcademy}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textAlign: 'center',
              padding: '0.25rem',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#38bdf8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            View all 6 stages & finger guides →
          </button>
        )}
      </div>
    </div>
  );
};
