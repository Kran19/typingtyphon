'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EngineResult, GuestSessionMigrationItem } from '@typingtyphon/contracts';
import { TypingEngine, TypingEngineState } from '../engine/TypingEngine';
import { generateTestWords } from '../lib/wordLists';

interface TypingCanvasProps {
  durationSeconds: number;
  onComplete: (result: EngineResult) => void;
  restartTrigger: number;
  onRestart: () => void;
  customWords?: string[];
  previousSession?: GuestSessionMigrationItem | null;
  drillBadge?: {
    stageTitle: string;
    lessonTitle: string;
    targetKeys: string[];
    passGoal: string;
  } | null;
  onActiveCharChange?: (char: string) => void;
}

export const TypingCanvas: React.FC<TypingCanvasProps> = ({
  durationSeconds,
  onComplete,
  restartTrigger,
  onRestart,
  customWords,
  previousSession,
  drillBadge,
  onActiveCharChange,
}) => {
  const [engine, setEngine] = useState<TypingEngine>(() => {
    const initialWords = customWords && customWords.length > 0 ? customWords : generateTestWords(120, 42);
    return new TypingEngine(initialWords, {
      durationSeconds,
      mode: 'words',
    });
  });

  const [engineState, setEngineState] = useState<TypingEngineState>(() => engine.getState());
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsTrackRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isCompletedRef = useRef(false);

  // Initialize or reset engine when duration, customWords, or restart trigger changes
  useEffect(() => {
    isCompletedRef.current = false;
    startTimeRef.current = null;
    setScrollOffset(0);
    const wordsToUse = customWords && customWords.length > 0 ? customWords : generateTestWords(120);
    const newEngine = new TypingEngine(wordsToUse, {
      durationSeconds,
      mode: 'words',
    });
    setEngine(newEngine);
    setEngineState(newEngine.getState());

    // Auto focus hidden input
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [durationSeconds, restartTrigger, customWords]);

  // High-resolution animation timer loop
  const runTimerLoop = useCallback(() => {
    if (!startTimeRef.current || isCompletedRef.current) return;

    const now = performance.now();
    const elapsedSec = (now - startTimeRef.current) / 1000;

    engine.tickTimer(elapsedSec);
    setEngineState(engine.getState());

    if (engine.getStatus() === 'completed') {
      isCompletedRef.current = true;
      const result = engine.getResult();
      if (result) {
        onComplete(result);
      }
      return;
    }

    animFrameRef.current = requestAnimationFrame(runTimerLoop);
  }, [engine, onComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement> | KeyboardEvent) => {
      // Detect CapsLock state
      setCapsLockActive(e.getModifierState && e.getModifierState('CapsLock'));

      // Quick restart shortcut: Tab or Esc
      if (e.key === 'Tab' || e.key === 'Escape') {
        e.preventDefault();
        onRestart();
        return;
      }

      if (isCompletedRef.current) return;

      // Start timer on first valid keydown
      if (engine.getStatus() === 'idle') {
        startTimeRef.current = performance.now();
        animFrameRef.current = requestAnimationFrame(runTimerLoop);
      }

      // Handle backspace (with Ctrl/Alt support)
      if (e.key === 'Backspace') {
        e.preventDefault();
        engine.handleBackspace(e.ctrlKey || e.altKey);
        setEngineState(engine.getState());
        return;
      }

      // Ignore non-printable modifier/function keys
      if (e.key.length > 1) {
        return;
      }

      e.preventDefault();
      engine.handleKeypress(e.key);
      setEngineState(engine.getState());

      // If engine finished from word completion
      if (engine.getStatus() === 'completed' && !isCompletedRef.current) {
        isCompletedRef.current = true;
        const res = engine.getResult();
        if (res) onComplete(res);
      }
    },
    [engine, onRestart, runTimerLoop, onComplete]
  );

  // Global window listener for frictionless typing anywhere on the page
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        target.id !== 'canvas-hidden-input'
      ) {
        return;
      }

      if (isCompletedRef.current) return;

      handleKeyDown(e);
    };

    const handleBlur = () => {
      engine.resetKeystrokeTimer();
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, engine]);

  const handleCanvasClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const { words, activeWordIndex, activeCharIndex, remainingSeconds, netWpm, accuracyPct, errorCount } = engineState;

  // Track active word line: keep lines 1, 2, and 3 stationary as user requested:
  // "let it be as it is until i do not reach last line after that you can up up one line"
  useEffect(() => {
    const activeWordEl = document.getElementById(`word-${activeWordIndex}`);
    if (activeWordEl && wordsTrackRef.current) {
      const track = wordsTrackRef.current;
      const firstWord = track.firstElementChild as HTMLElement | null;
      const baseTop = firstWord ? firstWord.offsetTop : 0;
      const wordTop = activeWordEl.offsetTop - baseTop;
      const lineHeight = activeWordEl.offsetHeight || 44;

      // 0-based line index (Line 1 = 0, Line 2 = 1, Line 3 = 2, Line 4 = 3...)
      const lineIndex = Math.max(0, Math.round(wordTop / lineHeight));

      // 3 visible lines in box (lines 0, 1, 2).
      // Keep completely static at offset 0 while typing on lines 1, 2, and 3.
      // Only when moving beyond the 3rd line (to line 4+) does it scroll up one line at a time:
      const targetOffset = lineIndex > 2 ? (lineIndex - 2) * lineHeight : 0;
      setScrollOffset(targetOffset);
    }
  }, [activeWordIndex]);

  // Synchronize active character with FingerGuide in real time
  useEffect(() => {
    if (onActiveCharChange && words[activeWordIndex]) {
      const curWord = words[activeWordIndex];
      if (activeCharIndex < curWord.chars.length) {
        onActiveCharChange(curWord.chars[activeCharIndex].char);
      } else {
        onActiveCharChange(' ');
      }
    }
  }, [words, activeWordIndex, activeCharIndex, onActiveCharChange]);

  // Format mm:ss for time remaining
  const secTotal = Math.max(0, Math.ceil(remainingSeconds));
  const timeMin = Math.floor(secTotal / 60).toString().padStart(2, '0');
  const timeSec = (secTotal % 60).toString().padStart(2, '0');
  const formattedTime = `${timeMin}:${timeSec}`;

  // Deltas against previous guest test (if available)
  const hasPrev = !!previousSession && engine.getStatus() !== 'idle';
  const wpmDelta = hasPrev ? Math.round(netWpm - previousSession.netWpm) : 0;
  const accDelta = hasPrev ? Math.round(accuracyPct - previousSession.accuracyPct) : 0;
  const errDelta = hasPrev ? errorCount - previousSession.errorCount : 0;

  return (
    <div className="typing-protected-zone" onClick={handleCanvasClick}>
      {/* Curriculum Drill Context Banner (if active) */}
      {drillBadge && (
        <div
          style={{
            background: 'rgba(14, 165, 233, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '0.75rem',
            padding: '0.65rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8', fontWeight: 700 }}>
              {drillBadge.stageTitle}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {drillBadge.lessonTitle}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Keys:</span>
              {drillBadge.targetKeys.map((k) => (
                <kbd
                  key={k}
                  style={{
                    padding: '0.12rem 0.45rem',
                    borderRadius: '4px',
                    background: 'var(--brand-primary)',
                    border: '1px solid var(--brand-cyan)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {k === ' ' ? 'Space' : k.toUpperCase()}
                </kbd>
              ))}
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontWeight: 600,
              }}
            >
              Goal: {drillBadge.passGoal}
            </span>
          </div>
        </div>
      )}

      {/* Single Row of Metrics: WPM, Accuracy, Errors, Time Remaining */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '1rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.85rem',
          padding: '0.9rem 1.25rem',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* WPM Metric */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '70px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            WPM
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
            <span id="hud-wpm-value" className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {netWpm}
            </span>
            {hasPrev && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: wpmDelta >= 0 ? '#10b981' : '#f43f5e',
                }}
              >
                {wpmDelta >= 0 ? `▲ +${wpmDelta}` : `▼ ${wpmDelta}`}
              </span>
            )}
          </div>
        </div>

        {/* Accuracy Metric */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '70px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Accuracy
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
            <span id="hud-accuracy-value" className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: accuracyPct >= 95 ? '#10b981' : '#f59e0b', lineHeight: 1.1 }}>
              {accuracyPct}%
            </span>
            {hasPrev && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: accDelta >= 0 ? '#10b981' : '#f43f5e',
                }}
              >
                {accDelta >= 0 ? `▲ +${accDelta}%` : `▼ ${accDelta}%`}
              </span>
            )}
          </div>
        </div>

        {/* Errors Metric */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '70px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Errors
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
            <span id="hud-error-value" className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: errorCount > 0 ? '#f43f5e' : 'var(--text-secondary)', lineHeight: 1.1 }}>
              {errorCount}
            </span>
            {hasPrev && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: errDelta <= 0 ? '#10b981' : '#f43f5e',
                }}
              >
                {errDelta <= 0 ? `▼ ${errDelta}` : `▲ +${errDelta}`}
              </span>
            )}
          </div>
        </div>

        {/* Time Remaining Metric */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '80px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Time
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span
              id="hud-timer-value"
              className="tabular-nums"
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: remainingSeconds <= 10 ? '#f43f5e' : '#38bdf8',
                lineHeight: 1.1,
              }}
            >
              {formattedTime}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              / {durationSeconds}s
            </span>
          </div>
        </div>
      </div>

      {/* CapsLock Warning */}
      {capsLockActive && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#f59e0b',
            padding: '0.45rem 0.85rem',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          Caps Lock is ON
        </div>
      )}

      {/* Large Readable Protected Typing Canvas Panel */}
      <div
        id="typing-word-container"
        className="typing-canvas"
        tabIndex={0}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Hidden input to capture physical keystrokes */}
        <input
          id="canvas-hidden-input"
          aria-label="Typing test input buffer"
          ref={inputRef}
          type="text"
          autoFocus
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onKeyDown={handleKeyDown}
          style={{
            position: 'absolute',
            opacity: 0,
            left: 0,
            top: 0,
            width: '1px',
            height: '1px',
          }}
        />

        {/* Track of words smoothly scrolled vertically */}
        <div
          ref={wordsTrackRef}
          className="typing-words-track"
          style={{ transform: `translateY(-${scrollOffset}px)` }}
        >
          {words.map((wordItem, wIdx) => {
            const isCurrentWord = wIdx === activeWordIndex;

            return (
              <span
                key={wordItem.id}
                id={`word-${wIdx}`}
                className={`word ${isCurrentWord ? 'active-word' : ''}`}
              >
                {wordItem.chars.map((charItem, cIdx) => {
                  const isCurrentChar = isCurrentWord && cIdx === activeCharIndex;

                  let charClassName = `char char-${charItem.state}`;
                  if (isCurrentChar) {
                    charClassName += ' char-active';
                  }

                  return (
                    <span
                      key={`${wordItem.id}-${cIdx}`}
                      id={`char-${wIdx}-${cIdx}`}
                      className={charClassName}
                      style={{ position: 'relative' }}
                    >
                      {isCurrentChar && (
                        <span id="canvas-caret" className={`caret ${engine.getStatus() === 'idle' ? 'blink' : ''}`} />
                      )}
                      {charItem.char}
                    </span>
                  );
                })}

                {/* Trailing caret if cursor is at the end of current word */}
                {isCurrentWord && activeCharIndex >= wordItem.chars.length && (
                  <span className="char char-active" style={{ position: 'relative' }}>
                    <span id="canvas-caret" className="caret" />
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Short Keyboard Hints Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          padding: '0 0.25rem',
        }}
      >
        {/* Shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <kbd>Tab</kbd>
            <span>restart test</span>
          </div>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <kbd>Esc</kbd>
            <span>restart</span>
          </div>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <kbd>Ctrl + Backspace</kbd>
            <span>clear text</span>
          </div>
        </div>

        {/* Focus guidance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
          <span>Click anywhere on the text to focus</span>
        </div>
      </div>
    </div>
  );
};
