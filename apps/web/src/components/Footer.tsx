'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: '#0B1120',
        padding: '2.5rem 1.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/" style={{ fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em', textDecoration: 'none' }}>
              TYPING TYPHON
            </Link>
            <span>—</span>
            <span>The Open Touch-Typing Education & Speed Benchmarking Platform</span>
          </div>

          <nav aria-label="Footer Navigation" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/practice" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Speed Test
            </Link>
            <Link href="/lessons" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Curriculum
            </Link>
            <Link href="/accuracy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Accuracy Guide
            </Link>
            <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Terms of Service
            </Link>
          </nav>
        </div>

        <div
          style={{
            borderTop: '1px solid #1E293B',
            paddingTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.75rem',
          }}
        >
          <div>
            © {new Date().getFullYear()} Typing Typhon. All rights reserved. Zero paywalls for foundational touch typing.
          </div>
          <div>
            Protected Active Canvas: No disruptive display advertising during typing sessions.
          </div>
        </div>
      </div>
    </footer>
  );
};

