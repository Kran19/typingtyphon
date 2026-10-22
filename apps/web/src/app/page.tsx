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
import { AcademyCard } from '../components/AcademyCard';
import { ResultsModal } from '../components/ResultsModal';
import { GuestHistory } from '../components/GuestHistory';
import { CurriculumView } from '../components/CurriculumView';
import { FingerGuide } from '../components/FingerGuide';
import { KeybrResults } from '../components/KeybrResults';
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
  const [activeTab, setActiveTab] = useState<'speed' | 'curriculum' | 'results'>('speed');
  const [duration, setDuration] = useState<number>(60);
  const [restartCounter, setRestartCounter] = useState<number>(0);
  const [activeResult, setActiveResult] = useState<EngineResult | null>(null);
  const [guestSessions, setGuestSessions] = useState<GuestSessionMigrationItem[]>([]);
  const [curriculumProgress, setCurriculumProgress] = useState<Record<string, LessonProgress>>({});
  const [currentUser, setCurrentUser] = useState<UserProfileDto | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeTargetChar, setActiveTargetChar] = useState<string>('f');
  const [showFingerGuide, setShowFingerGuide] = useState<boolean>(true);

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
      // Offline fallback: practice cleanly without interruption
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

      saveGuestSession(result, `curriculum-${activeDrill.drillType}`);
    } else {
      setActiveLessonResult(null);
      saveGuestSession(result, 'words');
    }

    refreshGuestData();
    // Transition cleanly to dedicated Keybr speed & keyboard heatmap view
    setActiveTab('results');
  };

  const handleRestart = () => {
    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
    setActiveTab('speed');
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
    setActiveTab('speed');
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
    setActiveTab('speed');

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

  const handlePracticeSpecificKeys = (keys: string[]) => {
    const homeAnchors = ['f', 'j', 'd', 'k', 's', 'l'];
    const drills: string[] = [];
    const cleanKeys = keys.map((k) => k.toLowerCase()).filter((k) => k.length === 1);

    for (const k of cleanKeys) {
      drills.push(`${k}${k}${k}`);
      for (const h of homeAnchors) {
        drills.push(`${k}${h}${k}`);
        drills.push(`${h}${k}${h}`);
      }
    }

    const commonWords = [
      'the', 'that', 'with', 'have', 'this', 'from', 'they', 'here',
      'make', 'like', 'time', 'just', 'know', 'take', 'into', 'year',
      'good', 'some', 'could', 'them', 'look', 'work', 'first', 'even',
    ];
    for (const w of commonWords) {
      if (cleanKeys.some((k) => w.includes(k))) {
        drills.push(w);
      }
    }

    const finalWords = drills.slice(0, 50);
    while (finalWords.length < 40) {
      finalWords.push('practice');
    }

    setActiveDrill({
      stage: {
        stageNumber: 0,
        title: 'Keybr Weak Key Remediation',
        description: 'Adaptive drill targeting weak keys',
        requiredKeys: cleanKeys,
        lessons: [],
      } as any,
      lesson: {
        id: `remedial-${cleanKeys.join('')}`,
        stageNumber: 0,
        stageSlug: 'remedial',
        title: `Weak Keys Drill (${cleanKeys.map((k) => k.toUpperCase()).join(', ')})`,
        targetKeys: cleanKeys,
        targetFingers: {},
        description: 'Build confidence and eliminate hesitation on these keys',
        passThreshold: { minAccuracyPct: 95, minWpm: 20 },
        introDrill: finalWords,
        wordDrill: finalWords,
        remedialDrill: finalWords,
      },
      drillType: 'remedial',
      words: finalWords,
    });

    setActiveResult(null);
    setActiveLessonResult(null);
    setRestartCounter((prev) => prev + 1);
    setActiveTab('speed');
  };

  const previousSession = guestSessions.length > 0 ? guestSessions[0] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Compact Sticky Header */}
      <Header
        duration={duration}
        onDurationChange={handleDurationChange}
        guestTestCount={guestSessions.length}
        onRestart={handleRestart}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        hasResult={!!activeResult}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Speed Test Main View */}
        {activeTab === 'speed' && (
          <div
            ref={canvasRef}
            style={{
              maxWidth: '1380px',
              width: '100%',
              padding: '2rem 1.5rem 3rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.75rem',
            }}
          >
            {/* Title & Action Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1
                  style={{
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Build your typing <span style={{ color: '#38bdf8' }}>flow</span>
                </h1>
                <p
                  style={{
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                    color: 'var(--text-secondary)',
                    marginTop: '0.35rem',
                    lineHeight: 1.4,
                  }}
                >
                  Type naturally. Get faster. Build real touch typing skills from 0 to Hero.
                </p>
              </div>

              {/* Toggle Finger & Hands Guide Button */}
              <button
                onClick={() => setShowFingerGuide((prev) => !prev)}
                style={{
                  background: showFingerGuide ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  border: showFingerGuide ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
                  color: showFingerGuide ? '#38bdf8' : 'var(--text-secondary)',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>✋</span>
                <span>{showFingerGuide ? 'Hide Finger Guide' : 'Show Finger Guide & Hands'}</span>
              </button>
            </div>

            {/* Responsive Main Layout: 2-column on desktop, stacked on mobile */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 650px), 1fr))',
                gap: '1.75rem',
                alignItems: 'start',
              }}
            >
              {/* Left Column: Main Typing Workspace */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
                <TypingCanvas
                  durationSeconds={duration}
                  onComplete={handleTestComplete}
                  restartTrigger={restartCounter}
                  onRestart={handleRestart}
                  customWords={activeDrill ? activeDrill.words : undefined}
                  previousSession={previousSession}
                  onActiveCharChange={setActiveTargetChar}
                  drillBadge={
                    activeDrill
                      ? {
                          stageTitle: `Stage ${activeDrill.stage.stageNumber}: ${activeDrill.stage.title}`,
                          lessonTitle: `${activeDrill.lesson.title} (${activeDrill.drillType.toUpperCase()})`,
                          targetKeys: activeDrill.lesson.targetKeys,
                          passGoal: `≥ ${activeDrill.lesson.passThreshold.minAccuracyPct}% Acc & ${activeDrill.lesson.passThreshold.minWpm} WPM`,
                        }
                      : null
                  }
                />

                {/* Real-time Interactive Finger & Hands Guide */}
                {showFingerGuide && (
                  <FingerGuide
                    activeChar={activeTargetChar}
                    isDrill={!!activeDrill}
                    onSelectKeyToPractice={(k) => handlePracticeSpecificKeys([k])}
                  />
                )}
              </div>

              {/* Right Column: Learning Panel (Touch Typing Academy) */}
              <div style={{ maxWidth: '440px', width: '100%', justifySelf: 'stretch' }}>
                <AcademyCard
                  progressMap={curriculumProgress}
                  onSelectDrill={handleSelectDrill}
                  activeDrillLessonId={activeDrill?.lesson.id}
                  onExitDrill={handleExitDrill}
                  onOpenFullAcademy={() => setActiveTab('curriculum')}
                />
              </div>
            </div>

            {/* Collapsible Guest History & Progress Drawer */}
            <div style={{ marginTop: '0.5rem' }}>
              <GuestHistory
                sessions={guestSessions}
                stats={guestStats}
                onClearHistory={handleClearHistory}
              />
            </div>
          </div>
        )}

        {/* Full Academy Curriculum View (Tab) */}
        {activeTab === 'curriculum' && (
          <div style={{ width: '100%', maxWidth: '1200px', padding: '1.5rem 1.5rem 3rem 1.5rem' }}>
            <CurriculumView
              progressMap={curriculumProgress}
              onSelectDrill={handleSelectDrill}
              activeLessonId={activeDrill?.lesson.id}
            />
          </div>
        )}

        {/* Dedicated Keybr Post-Test Results & Speed Keyboard Heatmap View (Tab) */}
        {activeTab === 'results' && activeResult && (
          <KeybrResults
            result={activeResult}
            onRestart={handleRestart}
            guestSessionCount={guestSessions.length}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            lessonResult={activeLessonResult}
            onStartRecommendation={handleStartRecommendation}
            onPracticeSpecificKeys={handlePracticeSpecificKeys}
            onClose={() => setActiveTab('speed')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
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
