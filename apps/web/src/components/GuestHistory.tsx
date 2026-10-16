'use client';

import React, { useState } from 'react';
import { GuestSessionMigrationItem, UserProgressSummaryDto } from '@typingtyphon/contracts';

interface GuestHistoryProps {
  sessions: GuestSessionMigrationItem[];
  stats: UserProgressSummaryDto;
  onClearHistory: () => void;
}

export const GuestHistory: React.FC<GuestHistoryProps> = ({
  sessions,
  stats,
  onClearHistory,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (sessions.length === 0) {
    return (
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto 2.5rem auto',
          padding: '0 1.5rem',
          width: '100%',
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '1rem',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Guest Practice History (Local)
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.5 }}>
            Complete a test or academy drill above to track your speed progression, accuracy metrics, and consistency. No registration or login required.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto 3rem auto',
        padding: '0 1.5rem',
        width: '100%',
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '1rem',
          overflow: 'hidden',
        }}
      >
        {/* Toggle Bar */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Guest Practice History
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                background: '#334155',
                color: '#94A3B8',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                fontWeight: 600,
              }}
            >
              {sessions.length} saved
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
              <span>Best: <strong style={{ color: 'var(--char-correct)' }}>{stats.bestNetWpm} WPM</strong></span>
              <span>Avg: <strong style={{ color: 'var(--text-primary)' }}>{stats.averageNetWpm} WPM</strong></span>
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                color: 'var(--text-muted)',
              }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Collapsible Content */}
        {isOpen && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '1.5rem' }}>
            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tests Completed</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{stats.totalCompletedTests}</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Best Speed</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--char-correct)' }}>{stats.bestNetWpm} WPM</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Speed</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{stats.averageNetWpm} WPM</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Practice Time</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{stats.totalPracticeTimeSeconds}s</div>
              </div>
            </div>

            {/* Session Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
              {sessions.map((item, idx) => (
                <div
                  key={item.localId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-primary)',
                    borderRadius: '0.4rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>#{sessions.length - idx}</span>
                    <span style={{ fontWeight: 700, color: 'var(--char-correct)' }}>{item.netWpm} WPM</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.accuracyPct}% Acc</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({item.durationSeconds}s)</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {new Date(item.clientTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Storage Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                onClick={onClearHistory}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.35rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Clear Local History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
