'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EngineResult } from '@typingtyphon/contracts';
import { TypingEngine, TypingEngineState } from '../engine/TypingEngine';
import { generateTestWords } from '../lib/wordLists';

interface TypingCanvasProps {
  durationSeconds: number;
  onComplete: (result: EngineResult) => void;
  restartTrigger: number;
  onRestart: () => void;
  customWords?: string[];
  drillBadge?: {
    stageTitle: string;
    lessonTitle: string;
    targetKeys: string[];
    passGoal: string;
  } | null;
}

export const TypingCanvas: React.FC<TypingCanvasProps> = ({
  durationSeconds,
  onComplete,
  restartTrigger,
  onRestart,
  customWords,
  drillBadge,
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
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isCompletedRef = useRef(false);

  // Initialize or reset engine when duration, customWords, or restart trigger changes
  useEffect(() => {
    isCompletedRef.current = false;
    startTimeRef.current = null;
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

      // Quick restart shortcut: Tab + Enter or Esc
      if (e.key === 'Tab') {
        e.preventDefault();
        onRestart();
        return;
      }
      if (e.key === 'Escape') {
        onRestart();
        return;
      }

      if (isCompletedRef.current) return;

      // Start timer on first valid keydown
      if (engine.getStatus() === 'idle') {
        startTimeRef.current = performance.now();
        animFrameRef.current = requestAnimationFrame(runTimerLoop);
      }

      // Handle backspace
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
      // Do not capture typing if the user is typing into an account/modal input field
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

  // Window of words to display (optical center around active word)
  const windowStart = Math.max(0, activeWordIndex - 2);
  const visibleWords = words.slice(windowStart, windowStart + 35);

  return (
    <div className="typing-protected-zone" onClick={handleCanvasClick}>
      {/* Curriculum Drill Context Banner */}
      {drillBadge && (
        <div
          style={{
            background: 'rgba(2, 132, 199, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38BDF8', fontWeight: 700 }}>
              {drillBadge.stageTitle}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {drillBadge.lessonTitle}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Keys:</span>
              {drillBadge.targetKeys.map((k) => (
                <kbd
                  key={k}
                  style={{
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    background: '#0F172A',
                    border: '1px solid #38BDF8',
                    color: '#38BDF8',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {k === ' ' ? 'Space' : k.toUpperCase()}
                </kbd>
              ))}
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontWeight: 600,
              }}
            >
              Goal: {drillBadge.passGoal}
            </span>
          </div>
        </div>
      )}

      {/* Live Minimalist HUD */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0 0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span
            id="hud-timer-value"
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: remainingSeconds <= 10 ? 'var(--warning)' : 'var(--char-correct)',
              lineHeight: 1,
            }}
          >
            {Math.ceil(remainingSeconds)}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            seconds
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Speed</div>
            <div id="hud-wpm-value" style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {netWpm} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>WPM</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Accuracy</div>
            <div id="hud-accuracy-value" style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: accuracyPct >= 95 ? 'var(--success)' : 'var(--warning)' }}>
              {accuracyPct}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Errors</div>
            <div id="hud-error-value" style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: errorCount > 0 ? 'var(--char-incorrect)' : 'var(--text-secondary)' }}>
              {errorCount}
            </div>
          </div>
        </div>
      </div>

      {/* CapsLock Warning Banner */}
      {capsLockActive && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid var(--warning)',
            color: 'var(--warning)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          Caps Lock is ON
        </div>
      )}

      {/* Protected Typing Canvas */}
      <div
        id="typing-word-container"
        className="typing-canvas"
        tabIndex={0}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Hidden input buffer to intercept physical keyboard strokes cleanly */}
        <input
          id="canvas-hidden-input"
          aria-label="Typing test input"
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

        {visibleWords.map((wordItem, wOffset) => {
          const globalWordIndex = windowStart + wOffset;
          const isCurrentWord = globalWordIndex === activeWordIndex;

          return (
            <span
              key={wordItem.id}
              id={`word-${wOffset}`}
              className={`word ${isCurrentWord ? 'active-word' : ''}`}
            >
              {wordItem.chars.map((charItem, cIdx) => {
                const isCurrentChar = isCurrentWord && cIdx === activeCharIndex;

                return (
                  <span
                    key={`${wordItem.id}-${cIdx}`}
                    id={`char-${wOffset}-${cIdx}`}
                    className={`char char-${charItem.state}`}
                    style={{ position: 'relative' }}
                  >
                    {isCurrentChar && (
                      <span id="canvas-caret" className={`caret ${engine.getStatus() === 'idle' ? 'blink' : ''}`} />
                    )}
                    {charItem.char}
                  </span>
                );
              })}

              {/* Trailing caret if cursor is at the end of the word */}
              {isCurrentWord && activeCharIndex >= wordItem.chars.length && (
                <span className="char" style={{ position: 'relative' }}>
                  <span id="canvas-caret" className="caret" />
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Keyboard Shortcut Guidance */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <span>Press <kbd style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: '#1E293B', border: '1px solid #334155' }}>Tab</kbd> to restart</span>
        <span>•</span>
        <span>Click anywhere on the text to focus</span>
      </div>
    </div>
  );
};
