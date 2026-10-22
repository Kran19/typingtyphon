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
          maxWidth: '980px',
          margin: '0 auto 2.5rem auto',
          padding: '0 1.5rem',
          width: '100%',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '1rem',
            padding: '1.75rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Guest Session Tracker
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
            Complete your first test above to see local speed trends, accuracy history, and personal bests. No sign-up required.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '980px',
        margin: '0 auto 2.5rem auto',
        padding: '0 1.5rem',
        width: '100%',
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '1rem',
          overflow: 'hidden',
          transition: 'border-color 0.15s ease',
        }}
      >
        {/* Toggle Bar */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '1rem 1.35rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Practice History
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {sessions.length} tests
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                best:{' '}
                <strong style={{ color: '#38bdf8', fontWeight: 600 }}>{stats.bestNetWpm} WPM</strong>
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                avg:{' '}
                <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{stats.averageNetWpm} WPM</strong>
              </span>
            </div>
            <svg
              width="15"
              height="15"
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
          <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '1.25rem' }}>
            {/* Summary Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 0.9rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tests Completed</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{stats.totalCompletedTests}</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 0.9rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Best Speed</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{stats.bestNetWpm} WPM</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 0.9rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Speed</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{stats.averageNetWpm} WPM</div>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 0.9rem', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Practice Time</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{stats.totalPracticeTimeSeconds}s</div>
              </div>
            </div>

            {/* Session Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' }}>
              {sessions.map((item, idx) => (
                <div
                  key={item.localId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    background: 'var(--bg-primary)',
                    borderRadius: '0.35rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>#{sessions.length - idx}</span>
                    <span style={{ fontWeight: 600, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{item.netWpm} WPM</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{item.accuracyPct}% Acc</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>({item.durationSeconds}s)</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                    {new Date(item.clientTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Storage Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={onClearHistory}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '0.35rem',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f87171';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                Clear History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
