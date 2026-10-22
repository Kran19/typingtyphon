'use client';

import React, { useState } from 'react';
import {
  ALL_CURRICULUM_STAGES,
  CurriculumStage,
  CurriculumLesson,
  FingerAssignment,
  isLessonUnlocked,
  getMissingPrerequisites,
  findLessonById,
} from '@typingtyphon/contracts';
import {
  LessonProgress,
  getAggregateKeyAnalytics,
  getKeyPerformanceBreakdown,
} from '../lib/storage';
import { generatePracticeRecommendation } from '../lib/recommendations';

interface CurriculumViewProps {
  progressMap: Record<string, LessonProgress>;
  onSelectDrill: (
    stage: CurriculumStage,
    lesson: CurriculumLesson,
    drillType: 'intro' | 'word' | 'remedial',
    words: string[]
  ) => void;
  activeLessonId?: string | null;
}

const FINGER_DISPLAY_NAMES: Record<FingerAssignment, { label: string; color: string }> = {
  'left-pinky': { label: 'Left Pinky', color: '#EC4899' },
  'left-ring': { label: 'Left Ring', color: '#A855F7' },
  'left-middle': { label: 'Left Middle', color: '#3B82F6' },
  'left-index': { label: 'Left Index', color: '#06B6D4' },
  thumb: { label: 'Thumbs (Space)', color: '#10B981' },
  'right-index': { label: 'Right Index', color: '#14B8A6' },
  'right-middle': { label: 'Right Middle', color: '#6366F1' },
  'right-ring': { label: 'Right Ring', color: '#8B5CF6' },
  'right-pinky': { label: 'Right Pinky', color: '#F43F5E' },
};

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  progressMap,
  onSelectDrill,
  activeLessonId,
}) => {
  const [viewMode, setViewMode] = useState<'stages' | 'analytics'>('stages');
  const [selectedStageNumber, setSelectedStageNumber] = useState<number>(1);
  const [lockedAlertLessonId, setLockedAlertLessonId] = useState<string | null>(null);

  const currentStage =
    ALL_CURRICULUM_STAGES.find((s) => s.stageNumber === selectedStageNumber) ||
    ALL_CURRICULUM_STAGES[0];

  const totalLessons = ALL_CURRICULUM_STAGES.reduce((acc, s) => acc + s.lessons.length, 0);
  const passedLessonsCount = Object.values(progressMap).filter((p) => p.passed).length;

  const aggregateAnalytics = getAggregateKeyAnalytics();
  const breakdown = getKeyPerformanceBreakdown(aggregateAnalytics);
  const recommendation = generatePracticeRecommendation(
    aggregateAnalytics,
    progressMap,
    ALL_CURRICULUM_STAGES
  );

  const handleLaunchRecommendation = () => {
    if (!recommendation.suggestedLessonId) return;
    for (const stage of ALL_CURRICULUM_STAGES) {
      const lesson = stage.lessons.find((l) => l.id === recommendation.suggestedLessonId);
      if (lesson) {
        const words =
          recommendation.suggestedDrillType === 'remedial'
            ? lesson.remedialDrill
            : recommendation.suggestedDrillType === 'word'
            ? lesson.wordDrill
            : lesson.introDrill;
        onSelectDrill(stage, lesson, recommendation.suggestedDrillType || 'intro', words);
        break;
      }
    }
  };

  return (
    <section
      id="curriculum-view"
      style={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      {/* Academy Header Banner */}
      <div
        style={{
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '1.25rem',
          padding: '1.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            >
              Touch Typing Academy
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Stages 1–6 (Free &amp; Guest Accessible)
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>
            Systematic Alphabet Mastery
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem', maxWidth: '580px', lineHeight: 1.5 }}>
            Touch typing is neuromuscular motor memory. Master finger reaches systematically from home row anchors through top row, bottom row, numbers, and bilateral shift coordination.
          </p>
        </div>

        {/* Global Progress Pill */}
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1rem',
            padding: '1.1rem 1.6rem',
            textAlign: 'center',
            minWidth: '150px',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
            Progress
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8', margin: '0.15rem 0' }}>
            {passedLessonsCount} / {totalLessons}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Lessons Passed
          </div>
        </div>
      </div>

      {/* Academy Navigation Mode Switcher: Stages vs Analytics */}
      <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.25rem', borderRadius: '9999px', border: '1px solid var(--border-subtle)', alignSelf: 'flex-start' }}>
        <button
          id="btn-tab-curriculum-stages"
          onClick={() => setViewMode('stages')}
          style={{
            background: viewMode === 'stages' ? 'var(--brand-primary)' : 'transparent',
            border: viewMode === 'stages' ? '1px solid var(--brand-cyan)' : '1px solid transparent',
            color: viewMode === 'stages' ? '#ffffff' : 'var(--text-secondary)',
            padding: '0.35rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <span>📚</span>
          Stages 1–6 Lessons ({totalLessons})
        </button>

        <button
          id="btn-tab-curriculum-analytics"
          onClick={() => setViewMode('analytics')}
          style={{
            background: viewMode === 'analytics' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            border: viewMode === 'analytics' ? '1px solid #38BDF8' : '1px solid transparent',
            color: viewMode === 'analytics' ? '#38BDF8' : 'var(--text-secondary)',
            padding: '0.45rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>📊</span>
          Personalized Key Analytics
          {breakdown.weakKeys.length > 0 && (
            <span style={{ background: '#F59E0B', color: '#0F172A', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontSize: '0.7rem' }}>
              {breakdown.weakKeys.length}
            </span>
          )}
        </button>
      </div>

      {/* VIEW MODE 1: CURRICULUM STAGES & LESSONS */}
      {viewMode === 'stages' && (
        <>
          {/* Stage Selector Pills (Stages 1 through 6) */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {ALL_CURRICULUM_STAGES.map((stage) => {
              const isSelected = stage.stageNumber === selectedStageNumber;
              const stagePassed = stage.lessons.filter((l) => progressMap[l.id]?.passed).length;
              return (
                <button
                  type="button"
                  key={stage.slug}
                  id={`btn-stage-tab-${stage.stageNumber}`}
                  onClick={() => {
                    console.log('STAGE TAB CLICKED:', stage.stageNumber);
                    setSelectedStageNumber(stage.stageNumber);
                  }}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid #38BDF8' : '1px solid transparent',
                    color: isSelected ? '#38BDF8' : 'var(--text-secondary)',
                    borderRadius: '0.75rem',
                    padding: '0.6rem 1rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ pointerEvents: 'none' }}>Stage {stage.stageNumber}: {stage.title}</span>
                  <span
                    style={{
                      pointerEvents: 'none',
                      fontSize: '0.75rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      background: isSelected ? '#38BDF8' : '#334155',
                      color: isSelected ? '#0F172A' : '#94A3B8',
                    }}
                  >
                    {stagePassed}/{stage.lessons.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Description & Target Keys */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                Stage {currentStage.stageNumber}: {currentStage.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {currentStage.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Keys:</span>
              {currentStage.targetKeys.slice(0, 10).map((k) => (
                <kbd
                  key={k}
                  style={{
                    padding: '0.2rem 0.45rem',
                    borderRadius: '5px',
                    background: '#0F172A',
                    border: '1px solid #38BDF8',
                    color: '#38BDF8',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {k.toUpperCase()}
                </kbd>
              ))}
            </div>
          </div>

          {/* Stage Lessons List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {currentStage.lessons.map((lesson, idx) => {
              const progress = progressMap[lesson.id];
              const isPassed = !!progress?.passed;
              const isActive = activeLessonId === lesson.id;
              const isUnlocked = isLessonUnlocked(lesson, progressMap);
              const missingPrereqIds = getMissingPrerequisites(lesson, progressMap);
              const firstMissing = missingPrereqIds[0] ? findLessonById(missingPrereqIds[0]) : null;

              return (
                <div
                  key={lesson.id}
                  id={`card-lesson-${lesson.id}`}
                  style={{
                    background: isActive
                      ? 'rgba(2, 132, 199, 0.08)'
                      : !isUnlocked
                      ? 'rgba(15, 23, 42, 0.6)'
                      : 'var(--bg-surface)',
                    border: isActive
                      ? '1.5px solid #38BDF8'
                      : !isUnlocked
                      ? '1px dashed rgba(239, 68, 68, 0.35)'
                      : '1px solid var(--border-subtle)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  {/* Lesson Card Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Lesson {currentStage.stageNumber}.{idx + 1}
                        </span>
                        {isPassed ? (
                          <span
                            id={`badge-passed-${lesson.id}`}
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10B981',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            ✓ Passed ({progress.bestAccuracyPct}% acc, {progress.bestNetWpm} WPM)
                          </span>
                        ) : progress ? (
                          <span
                            id={`badge-attempted-${lesson.id}`}
                            style={{
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#F59E0B',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            Attempted ({progress.bestAccuracyPct}% acc — Need ≥ {lesson.passThreshold.minAccuracyPct}%)
                          </span>
                        ) : !isUnlocked ? (
                          <span
                            id={`badge-locked-${lesson.id}`}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#F87171',
                              border: '1px solid rgba(239, 68, 68, 0.35)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            🔒 Locked
                          </span>
                        ) : (
                          <span
                            id={`badge-notstarted-${lesson.id}`}
                            style={{
                              background: 'rgba(148, 163, 184, 0.12)',
                              color: '#94A3B8',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                            }}
                          >
                            Ready to Start
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {lesson.title}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
                        {lesson.description}
                      </p>
                      {lesson.learningObjective && (
                        <div style={{ fontSize: '0.8rem', color: '#38BDF8', marginTop: '0.35rem', fontStyle: 'italic' }}>
                          🎯 Objective: {lesson.learningObjective}
                        </div>
                      )}
                    </div>

                    {/* Pass Threshold Badge */}
                    <div
                      style={{
                        background: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Pass Goal:{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>
                        ≥ {lesson.passThreshold.minAccuracyPct}% Acc
                      </strong>{' '}
                      &amp;{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>
                        ≥ {lesson.passThreshold.minWpm} WPM
                      </strong>
                    </div>
                  </div>

                  {/* Finger Assignment Guide */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      background: 'var(--bg-primary)',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Finger Placement:
                    </span>
                    {Object.entries(lesson.targetFingers).map(([char, finger]) => {
                      const fingerInfo = FINGER_DISPLAY_NAMES[finger] || { label: finger, color: '#38BDF8' };
                      return (
                        <div
                          key={char}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background: '#0F172A',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '0.4rem',
                            border: '1px solid #334155',
                            fontSize: '0.75rem',
                          }}
                        >
                          <strong style={{ color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                            {char.toUpperCase()}
                          </strong>
                          <span style={{ color: fingerInfo.color, fontWeight: 500 }}>
                            {fingerInfo.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Locked Lesson Guidance Banner */}
                  {!isUnlocked && (
                    <div
                      id={`locked-guidance-${lesson.id}`}
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '0.75rem',
                        padding: '0.85rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🔒</span>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F87171' }}>
                            Prerequisite Lesson Required
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {firstMissing ? (
                              <>
                                Pass <strong>{firstMissing.lesson.title}</strong> (Stage {firstMissing.stage.stageNumber}: {firstMissing.stage.title}) with ≥ {firstMissing.lesson.passThreshold.minAccuracyPct}% accuracy to unlock.
                              </>
                            ) : (
                              'Complete preceding lessons to unlock this exercise.'
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {firstMissing && (
                          <button
                            id={`btn-goto-prereq-${lesson.id}`}
                            onClick={() => {
                              setSelectedStageNumber(firstMissing.stage.stageNumber);
                              setTimeout(() => {
                                const el = document.getElementById(`card-lesson-${firstMissing.lesson.id}`);
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 60);
                            }}
                            style={{
                              background: '#EF4444',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '0.375rem',
                              padding: '0.45rem 0.85rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
                            }}
                          >
                            <span>Go to Prerequisite</span>
                            <span>→</span>
                          </button>
                        )}
                        <button
                          id={`btn-override-unlock-${lesson.id}`}
                          onClick={() => onSelectDrill(currentStage, lesson, 'intro', lesson.introDrill)}
                          style={{
                            background: 'transparent',
                            border: '1px dashed #64748B',
                            color: '#94A3B8',
                            borderRadius: '0.375rem',
                            padding: '0.4rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title="Practice this lesson without meeting prerequisites"
                        >
                          Preview Drill Anyway
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Active Locked Attempt Guidance Warning */}
                  {lockedAlertLessonId === lesson.id && (
                    <div
                      id={`locked-alert-${lesson.id}`}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid #EF4444',
                        borderRadius: '0.5rem',
                        padding: '0.65rem 1rem',
                        color: '#FECACA',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>⚠️</span>
                        <span>
                          This lesson is locked! Complete {firstMissing ? `"${firstMissing.lesson.title}" in Stage ${firstMissing.stage.stageNumber}` : 'earlier prerequisites'} first to build proper finger technique.
                        </span>
                      </div>
                      <button
                        onClick={() => setLockedAlertLessonId(null)}
                        style={{ background: 'transparent', border: 'none', color: '#FECACA', cursor: 'pointer', fontWeight: 700 }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Drill Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    <button
                      id={`btn-drill-intro-${lesson.id}`}
                      onClick={() => {
                        if (!isUnlocked) {
                          setLockedAlertLessonId(lesson.id);
                          return;
                        }
                        onSelectDrill(currentStage, lesson, 'intro', lesson.introDrill);
                      }}
                      style={{
                        background: !isUnlocked
                          ? '#334155'
                          : 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                        border: !isUnlocked ? '1px solid #475569' : 'none',
                        color: !isUnlocked ? '#94A3B8' : '#FFFFFF',
                        padding: '0.55rem 1.15rem',
                        borderRadius: '0.5rem',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: !isUnlocked ? 'none' : '0 2px 8px rgba(2, 132, 199, 0.3)',
                        opacity: !isUnlocked ? 0.75 : 1,
                      }}
                    >
                      {!isUnlocked ? <span>🔒</span> : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                      Intro Drill ({lesson.introDrill.length} exercises)
                    </button>

                    <button
                      id={`btn-drill-word-${lesson.id}`}
                      onClick={() => {
                        if (!isUnlocked) {
                          setLockedAlertLessonId(lesson.id);
                          return;
                        }
                        onSelectDrill(currentStage, lesson, 'word', lesson.wordDrill);
                      }}
                      style={{
                        background: '#1E293B',
                        border: '1px solid #334155',
                        color: !isUnlocked ? '#64748B' : 'var(--text-primary)',
                        padding: '0.55rem 1.15rem',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        opacity: !isUnlocked ? 0.75 : 1,
                      }}
                    >
                      <span>🔤</span>
                      Word Drill ({lesson.wordDrill.length} words)
                    </button>

                    {lesson.remedialDrill.length > 0 && (
                      <button
                        id={`btn-drill-remedial-${lesson.id}`}
                        onClick={() => {
                          if (!isUnlocked) {
                            setLockedAlertLessonId(lesson.id);
                            return;
                          }
                          onSelectDrill(currentStage, lesson, 'remedial', lesson.remedialDrill);
                        }}
                        style={{
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: !isUnlocked ? '#B45309' : '#F59E0B',
                          padding: '0.55rem 1.15rem',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          opacity: !isUnlocked ? 0.75 : 1,
                        }}
                      >
                        <span>🎯</span>
                        Remedial Accuracy Drill
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* VIEW MODE 2: PERSONALIZED KEY ANALYTICS */}
      {viewMode === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Personalized Practice Recommendation Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1.5px solid #38BDF8',
              borderRadius: '1.25rem',
              padding: '1.5rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                  color: '#38BDF8',
                  background: 'rgba(56, 189, 248, 0.2)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                }}
              >
                Recommended Next Practice
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Deterministic Rule Engine (Zero AI / Reproducible)
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
              {recommendation.title}
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, maxWidth: '750px' }}>
              {recommendation.reason}
            </p>

            {recommendation.suggestedLessonId && (
              <button
                id="btn-launch-recommendation"
                onClick={handleLaunchRecommendation}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '0.35rem',
                  background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                }}
              >
                <span>🎯</span>
                Launch Recommended Drill Now →
              </button>
            )}
          </div>

          {/* Key Metric Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1rem',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weak Keys (Needs Focus)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: breakdown.weakKeys.length > 0 ? '#F59E0B' : '#10B981', margin: '0.25rem 0' }}>
                {breakdown.weakKeys.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Accuracy &lt; 90% with ≥ 2 errors
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1rem',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Slow Hesitation Keys</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38BDF8', margin: '0.25rem 0' }}>
                {breakdown.slowKeys.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Accurate but latency &gt; 1.6× average
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1rem',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Strong Touch Keys</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', margin: '0.25rem 0' }}>
                {breakdown.strongKeys.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                ≥ 96% accuracy &amp; clean cadence
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1rem',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Keystroke Latency</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', margin: '0.25rem 0' }}>
                {breakdown.overallAverageLatencyMs} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>ms</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Mean inter-keystroke interval
              </div>
            </div>
          </div>

          {/* Full Per-Key Telemetry Data Table */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflowX: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                All Tracked Keyboard Characters ({breakdown.totalTrackedKeys})
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sample gate: &lt; 5 attempts marked as insufficient data
              </span>
            </div>

            {Object.keys(aggregateAnalytics).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No keystroke data recorded yet. Complete your first practice test or Academy lesson to view per-key analytics!
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Key</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Attempts</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Accuracy</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Errors</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Corrected</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Avg Latency</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(aggregateAnalytics)
                    .sort((a, b) => b.totalAttempts - a.totalAttempts)
                    .map((item) => (
                      <tr key={item.key} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)' }}>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <kbd
                            style={{
                              background: '#0F172A',
                              border: '1px solid #38BDF8',
                              color: '#38BDF8',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {item.key === ' ' ? 'SPACE' : item.key.toUpperCase()}
                          </kbd>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{item.totalAttempts}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', color: item.accuracyPct >= 95 ? '#10B981' : item.accuracyPct >= 88 ? '#F59E0B' : '#EF4444', fontWeight: 700 }}>
                          {item.accuracyPct}%
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{item.errorCount}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{item.correctedCount}</td>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)' }}>{item.averageLatencyMs} ms</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              background:
                                item.sampleConfidence === 'high'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : item.sampleConfidence === 'moderate'
                                  ? 'rgba(56, 189, 248, 0.15)'
                                  : item.sampleConfidence === 'low'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(148, 163, 184, 0.12)',
                              color:
                                item.sampleConfidence === 'high'
                                  ? '#10B981'
                                  : item.sampleConfidence === 'moderate'
                                  ? '#38BDF8'
                                  : item.sampleConfidence === 'low'
                                  ? '#F59E0B'
                                  : '#94A3B8',
                              fontWeight: 600,
                            }}
                          >
                            {item.sampleConfidence.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
