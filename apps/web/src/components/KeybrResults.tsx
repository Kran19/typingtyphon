'use client';

import React, { useState } from 'react';
import { EngineResult, ALL_CURRICULUM_STAGES } from '@typingtyphon/contracts';
import { KEYBOARD_LAYOUT_ROWS, getFingerForKey, FINGER_DATA } from '../lib/fingerMapping';
import { generatePracticeRecommendation } from '../lib/recommendations';
import { getAggregateKeyAnalytics, getGuestCurriculumProgress, getKeyPerformanceBreakdown } from '../lib/storage';

interface KeybrResultsProps {
  result: EngineResult;
  onRestart: () => void;
  guestSessionCount: number;
  onOpenAuth?: () => void;
  lessonResult?: {
    lessonTitle: string;
    passed: boolean;
    passThreshold: { minAccuracyPct: number; minWpm: number };
    needsRemedial: boolean;
  } | null;
  onStartRecommendation?: (lessonId: string, drillType: 'intro' | 'word' | 'remedial') => void;
  onPracticeSpecificKeys?: (keys: string[]) => void;
  onClose?: () => void;
}

export const KeybrResults: React.FC<KeybrResultsProps> = ({
  result,
  onRestart,
  guestSessionCount,
  onOpenAuth,
  lessonResult,
  onStartRecommendation,
  onPracticeSpecificKeys,
  onClose,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const aggregateAnalytics = getAggregateKeyAnalytics();
  const curriculumProgress = getGuestCurriculumProgress();
  const breakdown = getKeyPerformanceBreakdown(aggregateAnalytics);
  const recommendation = generatePracticeRecommendation(
    aggregateAnalytics,
    curriculumProgress,
    ALL_CURRICULUM_STAGES
  );

  const correctedMistakes = Math.max(0, result.errorCount - result.uncorrectedErrors);

  // Combine current test key metrics with historical aggregate
  const perKey = result.perKeyMetrics || {};

  // Extract keys tested in this session
  const testedKeys = Object.keys(perKey);

  // Compute key heatmap status for a key string
  const getKeyStatus = (keyStr: string) => {
    const k = keyStr.toLowerCase();
    const metric = perKey[k] || aggregateAnalytics[k];
    if (!metric || metric.totalAttempts === 0) {
      return { status: 'untested', color: '#1e293b', textColor: '#64748b', metric: null };
    }

    if (metric.errorCount > 0 && metric.accuracyPct < 88) {
      return { status: 'weak', color: '#f43f5e', textColor: '#ffffff', metric };
    }
    if (metric.accuracyPct < 95 || metric.errorCount > 0) {
      return { status: 'moderate', color: '#f59e0b', textColor: '#070d1e', metric };
    }
    return { status: 'mastered', color: '#10b981', textColor: '#070d1e', metric };
  };

  // Inspect currently selected key or first weak key
  const activeInspectKey = selectedKey || (breakdown.weakKeys[0]?.key ?? testedKeys[0] ?? 'f');
  const inspectMetric = perKey[activeInspectKey.toLowerCase()] || aggregateAnalytics[activeInspectKey.toLowerCase()];
  const inspectFinger = getFingerForKey(activeInspectKey);

  const handleLaunchRec = () => {
    if (recommendation.suggestedLessonId && onStartRecommendation) {
      onStartRecommendation(
        recommendation.suggestedLessonId,
        recommendation.suggestedDrillType || 'intro'
      );
    } else {
      onRestart();
    }
  };

  const handlePracticeWeakest = () => {
    const weakKeyList = breakdown.weakKeys.map((w) => w.key);
    if (weakKeyList.length > 0 && onPracticeSpecificKeys) {
      onPracticeSpecificKeys(weakKeyList);
    } else if (onStartRecommendation && recommendation.suggestedLessonId) {
      handleLaunchRec();
    } else {
      onRestart();
    }
  };

  return (
    <div
      style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Top Breadcrumb & Action Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--brand-cyan)' }}>
            <span>Touch Typing Performance Analytics</span>
            <span>•</span>
            <span style={{ color: 'var(--text-muted)' }}>Keybr Matrix</span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0.25rem 0 0 0',
              letterSpacing: '-0.02em',
            }}
          >
            Session Analysis & Keyboard Heatmap
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={onRestart}
            className="btn-primary"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '0.65rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Take Another Test
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '0.65rem 1.15rem',
                borderRadius: '0.65rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Back to Test View
            </button>
          )}
        </div>
      </div>

      {/* Curriculum Lesson Feedback (if this test was a lesson drill) */}
      {lessonResult && (
        <div
          style={{
            borderRadius: '0.85rem',
            padding: '1.25rem 1.5rem',
            background: lessonResult.passed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: lessonResult.passed ? '1px solid #10b981' : '1px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '2rem' }}>{lessonResult.passed ? '🎉' : '🎯'}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: lessonResult.passed ? '#10b981' : '#f59e0b' }}>
              {lessonResult.passed ? 'Curriculum Lesson Passed!' : 'Accuracy Requirement Not Met'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {lessonResult.passed
                ? `You met the benchmark for ${lessonResult.lessonTitle} (≥ ${lessonResult.passThreshold.minAccuracyPct}% Acc & ${lessonResult.passThreshold.minWpm} WPM). Your muscle memory is locking in!`
                : `Touch typing requires high accuracy (≥ ${lessonResult.passThreshold.minAccuracyPct}%) before speeding up. Take the targeted remedial drill below to solidify finger habits.`}
            </div>
          </div>
        </div>
      )}

      {/* Hero Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Net WPM */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Net Speed
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
            <span className="tabular-nums" style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--char-correct)', lineHeight: 1 }}>
              {result.netWpm}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>WPM</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Error-penalized productive speed
          </span>
        </div>

        {/* Accuracy */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Accuracy
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
            <span className="tabular-nums" style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: result.accuracyPct >= 95 ? '#10b981' : '#f59e0b', lineHeight: 1 }}>
              {result.accuracyPct}%
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Target: ≥ 95% touch typing gate
          </span>
        </div>

        {/* Gross Speed */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Raw Speed
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
            <span className="tabular-nums" style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1 }}>
              {result.grossWpm}
            </span>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>WPM</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Raw keystroke output
          </span>
        </div>

        {/* Errors & Consistency */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Errors & Consistency
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0.5rem 0' }}>
            <div>
              <span className="tabular-nums" style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: result.errorCount > 0 ? '#f43f5e' : 'var(--text-secondary)' }}>
                {result.errorCount}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>errors</span>
            </div>
            <div>
              <span className="tabular-nums" style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                {result.consistencyPct}%
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>rhythm</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {correctedMistakes} corrected • {result.uncorrectedErrors} uncorrected
          </span>
        </div>
      </div>

      {/* Main Keybr Section: Heatmap Keyboard & Key Inspector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 650px), 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Visual Keybr Keyboard Heatmap */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Heatmap Legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Keybr Frequency & Speed Heatmap
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Every key analyzed for latency, confidence, and mistake frequency
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
                <span>Mastered (≥95%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }} />
                <span>Needs Work</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f43f5e' }} />
                <span>Struggling</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1e293b' }} />
                <span>Untested</span>
              </div>
            </div>
          </div>

          {/* Interactive Keyboard Heatmap Render */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              padding: '0.85rem',
              background: '#070d1e',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '0.85rem',
              overflowX: 'auto',
            }}
          >
            {KEYBOARD_LAYOUT_ROWS.map((row, rIdx) => (
              <div
                key={rIdx}
                style={{
                  display: 'flex',
                  gap: '0.35rem',
                  width: '100%',
                  minWidth: '580px',
                }}
              >
                {row.map((kItem) => {
                  const heat = getKeyStatus(kItem.key);
                  const isSelected = activeInspectKey.toLowerCase() === kItem.key.toLowerCase();

                  return (
                    <button
                      key={kItem.key}
                      onClick={() => setSelectedKey(kItem.key)}
                      style={{
                        flex: kItem.width || 1,
                        minWidth: '32px',
                        height: '42px',
                        borderRadius: '6px',
                        background: isSelected
                          ? '#ffffff'
                          : heat.status === 'untested'
                          ? 'rgba(15, 23, 42, 0.8)'
                          : heat.color,
                        border: isSelected
                          ? '2px solid #38bdf8'
                          : `1px solid ${heat.status === 'untested' ? '#1e293b' : heat.color}`,
                        color: isSelected
                          ? '#070d1e'
                          : heat.status === 'untested'
                          ? '#64748b'
                          : heat.textColor,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        boxShadow: isSelected
                          ? '0 0 16px rgba(56, 189, 248, 0.9)'
                          : heat.status !== 'untested'
                          ? `0 2px 8px ${heat.color}44`
                          : 'none',
                        transform: isSelected ? 'scale(1.08)' : 'none',
                        transition: 'all 0.12s ease',
                      }}
                      title={`${kItem.display}: ${heat.metric ? `${heat.metric.accuracyPct}% accuracy` : 'Untested'}`}
                    >
                      <span>{kItem.display}</span>
                      {heat.metric && heat.metric.totalAttempts > 0 && (
                        <span style={{ fontSize: '0.6rem', opacity: 0.85 }}>
                          {heat.metric.accuracyPct}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Quick Tip beneath keyboard */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Click any key on the heatmap to view latency, errors, and target speed.</span>
            <span>Based on Keybr adaptive analysis model</span>
          </div>
        </div>

        {/* Right Column: Key Inspector & Weak Keys Action Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Key Inspector Card */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <kbd
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: '#ffffff',
                    background: 'var(--brand-primary)',
                    border: '2px solid var(--brand-cyan)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
                  }}
                >
                  {activeInspectKey === ' ' ? 'SPACE' : activeInspectKey.toUpperCase()}
                </kbd>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Key Performance
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: inspectFinger?.color ?? 'var(--text-muted)', fontWeight: 600 }}>
                    {inspectFinger ? `${inspectFinger.name} Finger` : 'Standard Key'}
                  </div>
                </div>
              </div>

              {inspectMetric && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    background: inspectMetric.accuracyPct >= 95 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: inspectMetric.accuracyPct >= 95 ? '#10b981' : '#f43f5e',
                    border: `1px solid ${inspectMetric.accuracyPct >= 95 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
                  }}
                >
                  {inspectMetric.accuracyPct >= 95 ? 'Strong Key' : 'Needs Practice'}
                </span>
              )}
            </div>

            {inspectMetric ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem',
                  background: 'rgba(7, 13, 30, 0.6)',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Accuracy</div>
                  <div className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: inspectMetric.accuracyPct >= 95 ? '#10b981' : '#f43f5e' }}>
                    {inspectMetric.accuracyPct}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Attempts</div>
                  <div className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {inspectMetric.totalAttempts}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mistakes / Errors</div>
                  <div className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: inspectMetric.errorCount > 0 ? '#f43f5e' : '#10b981' }}>
                    {inspectMetric.errorCount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reaction Latency</div>
                  <div className="tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                    {inspectMetric.averageLatencyMs ? `${inspectMetric.averageLatencyMs}ms` : '< 200ms'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1rem', background: 'rgba(7, 13, 30, 0.6)', borderRadius: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Key has not been typed yet in this test. Type words containing &quot;{activeInspectKey.toUpperCase()}&quot; to generate telemetry.
              </div>
            )}
          </div>

          {/* Weak Keys Targeted Practice Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '1rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: '#38bdf8' }}>
                Keybr Adaptive Remediation
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Targeted Drill
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                {breakdown.weakKeys.length > 0
                  ? `Focus on Weak Keys: ${breakdown.weakKeys.slice(0, 4).map((w) => w.key.toUpperCase()).join(', ')}`
                  : 'Mastery in Progress'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {breakdown.weakKeys.length > 0
                  ? 'Keybr recommends immediate repetition drills for keys with elevated latency or error rates before advancing to new lessons.'
                  : 'Great run! Continue along your curriculum progression or take another speed benchmark.'}
              </p>
            </div>

            <button
              onClick={handlePracticeWeakest}
              className="btn-primary"
              style={{
                alignSelf: 'flex-start',
                padding: '0.75rem 1.35rem',
                borderRadius: '0.65rem',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {breakdown.weakKeys.length > 0 ? 'Practice Weak Keys Now →' : 'Continue Learning →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
