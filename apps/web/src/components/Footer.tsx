'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-primary)',
        padding: '2rem 1.5rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          maxWidth: '980px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Link
              href="/"
              style={{
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.08em',
                fontFamily: 'var(--font-mono)',
                textDecoration: 'none',
              }}
            >
              TYPHON<span style={{ color: '#f59e0b' }}>.</span>
            </Link>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <span style={{ fontSize: '0.78rem' }}>Next-gen touch typing & speed benchmark</span>
          </div>

          <nav aria-label="Footer Navigation" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link href="/practice" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Practice
            </Link>
            <Link href="/lessons" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Curriculum
            </Link>
            <Link href="/accuracy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Accuracy Guide
            </Link>
            <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Privacy
            </Link>
            <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.15s ease' }}>
              Terms
            </Link>
          </nav>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Typing Typhon. Guest-First & Zero Paywalls.
          </div>
          <div>
            Distraction-free protected typing zone.
          </div>
        </div>
      </div>
    </footer>
  );
};
