'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  EngineResult,
  GuestSessionMigrationItem,
  UserProgressSummaryDto,
  CurriculumStage,
  CurriculumLesson,
  UserProfileDto,
  ALL_CURRICULUM_STAGES,
} from '@typingtyphon/contracts';
import { Header } from '../components/Header';
import { TypingCanvas } from '../components/TypingCanvas';
import { ResultsModal } from '../components/ResultsModal';
import { GuestHistory } from '../components/GuestHistory';
import { CurriculumView } from '../components/CurriculumView';
import { AuthModal } from '../components/AuthModal';
import { Footer } from '../components/Footer';
import {
  getGuestSessions,
  getGuestStats,
  saveGuestSession,
  clearGuestSessions,
  getGuestCurriculumProgress,
  saveGuestLessonAttempt,
  LessonProgress,
} from '../lib/storage';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'speed' | 'curriculum'>('speed');
  const [duration, setDuration] = useState<number>(60);
  const [restartCounter, setRestartCounter] = useState<number>(0);
  const [activeResult, setActiveResult] = useState<EngineResult | null>(null);
  const [guestSessions, setGuestSessions] = useState<GuestSessionMigrationItem[]>([]);
  const [curriculumProgress, setCurriculumProgress] = useState<Record<string, LessonProgress>>({});
  const [currentUser, setCurrentUser] = useState<UserProfileDto | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeDrill, setActiveDrill] = useState<{
    stage: CurriculumStage;
    lesson: CurriculumLesson;
    drillType: 'intro' | 'word' | 'remedial';
    words: string[];
  } | null>(null);
  const [activeLessonResult, setActiveLessonResult] = useState<{
    lessonTitle: string;
    passed: boolean;
    passThreshold: { minAccuracyPct: number; minWpm: number };
    needsRemedial: boolean;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const [guestStats, setGuestStats] = useState<UserProgressSummaryDto>({
    totalCompletedTests: 0,
    totalPracticeTimeSeconds: 0,
    bestNetWpm: 0,
    averageNetWpm: 0,
    bestAccuracyPct: 100,
    averageAccuracyPct: 100,
    currentStreakDays: 0,
  });

  // Load guest history, curriculum progress, and check optional auth session on mount
  useEffect(() => {
    refreshGuestData();
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
      const res = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch {
      // Backend offline or unreachable: user practices smoothly as guest without interruption
    }
  };

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
    } catch {
      // offline
    }
    setCurrentUser(null);
    setIsAuthModalOpen(false);
  };

  const refreshGuestData = () => {
    const sessions = getGuestSessions();
    const stats = getGuestStats();
    const currProg = getGuestCurriculumProgress();
    setGuestSessions(sessions);
    setGuestStats(stats);
    setCurriculumProgress(currProg);
  };

  const handleTestComplete = (result: EngineResult) => {
    setActiveResult(result);

    if (activeDrill) {
      // Evaluate lesson pass/fail criteria
      const isPass =
        result.accuracyPct >= activeDrill.lesson.passThreshold.minAccuracyPct &&
        result.netWpm >= activeDrill.lesson.passThreshold.minWpm;

      saveGuestLessonAttempt(activeDrill.lesson.id, result, activeDrill.lesson.passThreshold);

      setActiveLessonResult({
        lessonTitle: activeDrill.lesson.title,
        passed: isPass,
        passThreshold: activeDrill.lesson.passThreshold,
        needsRemedial: !isPass,
      });

      // Also persist to guest history
      saveGuestSession(result, `curriculum-${activeDrill.drillType}`);
    } else {
      setActiveLessonResult(null);
      saveGuestSession(result, 'words');
    }

    refreshGuestData();
  };

  const handleRestart = () => {
    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your local guest practice history?')) {
      clearGuestSessions();
      refreshGuestData();
    }
  };

  const handleSelectDrill = (
    stage: CurriculumStage,
    lesson: CurriculumLesson,
    drillType: 'intro' | 'word' | 'remedial',
    words: string[]
  ) => {
    setActiveDrill({
      stage,
      lesson,
      drillType,
      words,
    });
    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);

    // Smoothly scroll canvas into focus
    if (canvasRef.current) {
      canvasRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleExitDrill = () => {
    setActiveDrill(null);
    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
  };

  const handleStartRecommendation = (lessonId: string, drillType: 'intro' | 'word' | 'remedial') => {
    for (const stage of ALL_CURRICULUM_STAGES) {
      const lesson = stage.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        const words =
          drillType === 'remedial'
            ? lesson.remedialDrill
            : drillType === 'word'
            ? lesson.wordDrill
            : lesson.introDrill;
        handleSelectDrill(stage, lesson, drillType, words);
        break;
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Global Header */}
      <Header
        duration={duration}
        onDurationChange={handleDurationChange}
        guestTestCount={guestSessions.length}
        onRestart={handleRestart}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Protected Active Typing Canvas & Drill State */}
        <div ref={canvasRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {activeDrill && (
            <div style={{ maxWidth: '1000px', width: '100%', padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleExitDrill}
                style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid #334155',
                  color: 'var(--text-secondary)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                ✕ Exit Lesson Drill (Back to Free Practice)
              </button>
            </div>
          )}

          <TypingCanvas
            durationSeconds={duration}
            onComplete={handleTestComplete}
            restartTrigger={restartCounter}
            onRestart={handleRestart}
            customWords={activeDrill ? activeDrill.words : undefined}
            drillBadge={
              activeDrill
                ? {
                    stageTitle: `Stage ${activeDrill.stage.stageNumber}: ${activeDrill.stage.title}`,
                    lessonTitle: `${activeDrill.lesson.title} (${activeDrill.drillType.toUpperCase()} DRILL)`,
                    targetKeys: activeDrill.lesson.targetKeys,
                    passGoal: `≥ ${activeDrill.lesson.passThreshold.minAccuracyPct}% Acc & ${activeDrill.lesson.passThreshold.minWpm} WPM`,
                  }
                : null
            }
          />
        </div>

        {/* Post-Test Results Modal */}
        {activeResult && (
          <ResultsModal
            result={activeResult}
            onRestart={handleRestart}
            guestSessionCount={guestSessions.length}
            lessonResult={activeLessonResult}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onStartRecommendation={handleStartRecommendation}
          />
        )}

        {/* Touch Typing Academy Curriculum (Stages 1 & 2) */}
        <CurriculumView
          progressMap={curriculumProgress}
          onSelectDrill={handleSelectDrill}
          activeLessonId={activeDrill?.lesson.id}
        />

        {/* Recent Guest Practice History */}
        <GuestHistory
          sessions={guestSessions}
          stats={guestStats}
          onClearHistory={handleClearHistory}
        />

        {/* Feature Highlights Grid */}
        <section
          style={{
            maxWidth: '1000px',
            width: '100%',
            padding: '2rem 1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '1.5rem',
            }}
          >
            <div style={{ color: 'var(--char-correct)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Frictionless & Instant
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Start typing immediately without signing up, clicking modals, or paying fees. Your recent practice results are retained locally.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '1.5rem',
            }}
          >
            <div style={{ color: 'var(--warning)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>🎯</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Alphabet Touch Typing
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Master touch typing with systematic alphabet-by-alphabet stages, tactile finger positioning guides, and deterministic weak-key drills.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '1.5rem',
            }}
          >
            <div style={{ color: 'var(--success)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>🛡️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Verifiable Certificates
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Earn printable typing certificates with cryptographic public verification links suitable for job applications and resume proof.
            </p>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Optional Account & Guest History Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
        onLogout={handleLogout}
        guestSessions={guestSessions}
        onRefreshGuestData={refreshGuestData}
      />
    </div>
  );
}
