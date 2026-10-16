'use client';

import { UserProfileDto } from '@typingtyphon/contracts';

interface HeaderProps {
  duration: number;
  onDurationChange: (duration: number) => void;
  guestTestCount: number;
  onRestart: () => void;
  activeTab?: 'speed' | 'curriculum';
  onTabChange?: (tab: 'speed' | 'curriculum') => void;
  currentUser?: UserProfileDto | null;
  onOpenAuth?: () => void;
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
}) => {
  return (
    <header style={{ width: '100%', padding: '0.9rem 1.5rem' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Brand Logo & Mode Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }} onClick={onRestart}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m13 2-2 10h6l-7 10 2-10H6l7-10z" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.02em', color: '#F8FAFC' }}>
                TYPING <span style={{ color: '#38BDF8' }}>TYPHON</span>
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          {onTabChange && (
            <div style={{ display: 'flex', background: '#0F172A', padding: '0.2rem', borderRadius: '0.6rem', border: '1px solid #334155' }}>
              <button
                onClick={() => onTabChange('speed')}
                style={{
                  background: activeTab === 'speed' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: activeTab === 'speed' ? '1px solid #38BDF8' : '1px solid transparent',
                  color: activeTab === 'speed' ? '#38BDF8' : 'var(--text-secondary)',
                  borderRadius: '0.5rem',
                  padding: '0.35rem 0.8rem',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                ⚡ Speed Test
              </button>
              <button
                onClick={() => onTabChange('curriculum')}
                style={{
                  background: activeTab === 'curriculum' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: activeTab === 'curriculum' ? '1px solid #38BDF8' : '1px solid transparent',
                  color: activeTab === 'curriculum' ? '#38BDF8' : 'var(--text-secondary)',
                  borderRadius: '0.5rem',
                  padding: '0.35rem 0.8rem',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                🎓 Academy (Stages 1–6)
              </button>
            </div>
          )}
        </div>


        {/* Duration Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#1E293B', padding: '0.25rem 0.5rem', borderRadius: '9999px', border: '1px solid #334155' }}>
          {[15, 30, 60, 120].map((d) => (
            <button
              key={d}
              onClick={() => onDurationChange(d)}
              className={`control-pill ${duration === d ? 'active' : ''}`}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.825rem', border: 'none' }}
              title={`Set test duration to ${d} seconds`}
            >
              {d}s
            </button>
          ))}
        </div>

        {/* Right Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '9999px',
              background: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: '0.825rem',
              color: '#38BDF8',
              fontWeight: 500,
            }}
          >
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            {currentUser ? 'Cloud Synced' : `Guest (${guestTestCount} tests)`}
          </div>

          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                background: currentUser ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.8)',
                border: currentUser ? '1px solid #38BDF8' : '1px solid #334155',
                fontSize: '0.825rem',
                color: currentUser ? '#38BDF8' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title={currentUser ? `Account: ${currentUser.username}` : 'Sign in or create account'}
            >
              <span>👤</span>
              {currentUser ? currentUser.username : 'Sign In'}
            </button>
          )}
          <button
            onClick={onRestart}
            className="control-pill"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.825rem' }}
            title="Restart test (Tab + Enter)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Restart
          </button>
        </div>
      </div>
    </header>
  );
};
