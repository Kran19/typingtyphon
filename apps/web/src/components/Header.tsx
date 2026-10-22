'use client';

import React from 'react';
import { UserProfileDto } from '@typingtyphon/contracts';

interface HeaderProps {
  duration: number;
  onDurationChange: (duration: number) => void;
  guestTestCount: number;
  onRestart: () => void;
  activeTab?: 'speed' | 'curriculum' | 'results';
  onTabChange?: (tab: 'speed' | 'curriculum' | 'results') => void;
  currentUser?: UserProfileDto | null;
  onOpenAuth?: () => void;
  hasResult?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  duration,
  onDurationChange,
  guestTestCount,
  onRestart,
  activeTab = 'speed',
  onTabChange,
  currentUser,
  onOpenAuth,
  hasResult = false,
}) => {
  return (
    <header
      style={{
        width: '100%',
        padding: '0.65rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(7, 13, 30, 0.92)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
        }}
      >
        {/* Brand Logo & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Logo */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            onClick={onRestart}
            title="Typing Typhon — Click to restart"
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(14, 165, 233, 0.4)',
                flexShrink: 0,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m13 2-2 10h6l-7 10 2-10H6l7-10z" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
                color: '#ffffff',
                fontFamily: 'var(--font-sans)',
              }}
            >
              TYPING <span style={{ color: '#38bdf8' }}>TYPHON</span>
            </span>
          </div>

          {/* Speed Test / Academy Navigation Toggle */}
          {onTabChange && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '0.2rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                onClick={() => onTabChange('speed')}
                style={{
                  background: activeTab === 'speed' ? 'var(--brand-primary)' : 'transparent',
                  border: 'none',
                  color: activeTab === 'speed' ? '#ffffff' : 'var(--text-secondary)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.95rem',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                  boxShadow: activeTab === 'speed' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m13 2-2 10h6l-7 10 2-10H6l7-10z" />
                </svg>
                Speed Test
              </button>
              <button
                onClick={() => onTabChange('curriculum')}
                style={{
                  background: activeTab === 'curriculum' ? 'var(--brand-primary)' : 'transparent',
                  border: 'none',
                  color: activeTab === 'curriculum' ? '#ffffff' : 'var(--text-secondary)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.95rem',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                  boxShadow: activeTab === 'curriculum' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                Academy
              </button>
              {hasResult && (
                <button
                  onClick={() => onTabChange('results')}
                  style={{
                    background: activeTab === 'results' ? 'var(--brand-primary)' : 'transparent',
                    border: 'none',
                    color: activeTab === 'results' ? '#ffffff' : 'var(--text-secondary)',
                    borderRadius: '9999px',
                    padding: '0.35rem 0.95rem',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease',
                    boxShadow: activeTab === 'results' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  Heatmap & Speed
                </button>
              )}
            </div>
          )}
        </div>

        {/* Center: Test Duration Selector Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '0.2rem 0.35rem',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {[15, 30, 60, 120].map((d) => (
            <button
              key={d}
              onClick={() => onDurationChange(d)}
              style={{
                background: duration === d ? 'var(--brand-primary)' : 'transparent',
                border: 'none',
                color: duration === d ? '#ffffff' : 'var(--text-secondary)',
                borderRadius: '9999px',
                padding: '0.28rem 0.75rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: duration === d ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: duration === d ? '0 2px 8px rgba(2, 132, 199, 0.35)' : 'none',
              }}
              title={`Test duration: ${d}s`}
            >
              {d}s
            </button>
          ))}
        </div>

        {/* Right Section: Guest status, Sign In, Restart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Guest Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.32rem 0.8rem',
              borderRadius: '9999px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.65)',
              }}
            />
            {currentUser ? currentUser.username : `Guest (${guestTestCount} tests)`}
          </div>

          {/* Sign In Button */}
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.32rem 0.85rem',
                borderRadius: '9999px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                e.currentTarget.style.color = '#38bdf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {currentUser ? 'Account' : 'Sign In'}
            </button>
          )}

          {/* Restart Button */}
          <button
            onClick={onRestart}
            title="Restart Test (or press Tab)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.32rem 0.75rem',
              borderRadius: '9999px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
              e.currentTarget.style.color = '#38bdf8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Restart
          </button>
        </div>
      </div>
    </header>
  );
};
