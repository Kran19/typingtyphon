'use client';

import React, { useState } from 'react';
import {
  FINGER_DATA,
  CHAR_TO_FINGER_MAP,
  KEYBOARD_LAYOUT_ROWS,
  getFingerForKey,
  FingerId,
} from '../lib/fingerMapping';

interface FingerGuideProps {
  activeChar?: string;
  isDrill?: boolean;
  onSelectKeyToPractice?: (key: string) => void;
}

export const FingerGuide: React.FC<FingerGuideProps> = ({
  activeChar,
  isDrill = false,
  onSelectKeyToPractice,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [activeRowTab, setActiveRowTab] = useState<'all' | 'home' | 'top' | 'bottom'>('all');

  const inspectedChar = activeChar || selectedKey || 'f';
  const activeFinger = getFingerForKey(inspectedChar);

  // Normalize key for matching against keyboard caps
  const normalizedInspected = inspectedChar.length === 1 ? inspectedChar.toLowerCase() : inspectedChar;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '1rem',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header & Active Finger Instruction Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontSize: '0.9rem',
            }}
          >
            ✋
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Touch Typing Finger Guide
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Master finger placement: 0 to Hero muscle memory
            </p>
          </div>
        </div>

        {/* Real-time active key target badge */}
        {activeFinger && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: activeFinger.badgeBg,
              border: `1px solid ${activeFinger.badgeBorder}`,
              borderRadius: '9999px',
              padding: '0.35rem 0.85rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target:</span>
            <kbd
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '0.85rem',
                color: '#ffffff',
                background: activeFinger.color,
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
              }}
            >
              {inspectedChar === ' ' ? 'SPACE' : inspectedChar.toUpperCase()}
            </kbd>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: activeFinger.color }}>
              Use {activeFinger.name}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Hands Graphic (Left Hand & Right Hand) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          background: 'rgba(7, 13, 30, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '0.85rem',
          padding: '1rem',
          alignItems: 'center',
        }}
      >
        {/* Left Hand Diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Left Hand (A S D F)
          </div>
          <svg width="240" height="150" viewBox="0 0 240 150" fill="none" style={{ maxWidth: '100%' }}>
            {/* Palm base */}
            <path
              d="M 50 145 C 50 90, 80 85, 120 85 C 160 85, 185 95, 185 145 Z"
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="2"
            />

            {/* Left Pinky */}
            <rect
              x="35"
              y="55"
              width="18"
              height="65"
              rx="9"
              fill={activeFinger?.id === 'left-pinky' ? FINGER_DATA['left-pinky'].color : '#1e293b'}
              stroke={activeFinger?.id === 'left-pinky' ? '#ffffff' : '#334155'}
              strokeWidth={activeFinger?.id === 'left-pinky' ? '2.5' : '1'}
              style={{
                transition: 'all 0.15s ease',
                filter: activeFinger?.id === 'left-pinky' ? 'drop-shadow(0 0 8px rgba(192, 132, 252, 0.8))' : 'none',
              }}
            />
            <text x="44" y="90" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">P</text>

            {/* Left Ring */}
            <rect
              x="62"
              y="32"
              width="19"
              height="80"
              rx="9.5"
              fill={activeFinger?.id === 'left-ring' ? FINGER_DATA['left-ring'].color : '#1e293b'}
              stroke={activeFinger?.id === 'left-ring' ? '#ffffff' : '#334155'}
              strokeWidth={activeFinger?.id === 'left-ring' ? '2.5' : '1'}
              style={{
                transition: 'all 0.15s ease',
                filter: activeFinger?.id === 'left-ring' ? 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.8))' : 'none',
              }}
            />
            <text x="71" y="70" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">R</text>

            {/* Left Middle */}
            <rect
              x="90"
              y="18"
              width="20"
              height="90"
              rx="10"
              fill={activeFinger?.id === 'left-middle' ? FINGER_DATA['left-middle'].color : '#1e293b'}
              stroke={activeFinger?.id === 'left-middle' ? '#ffffff' : '#334155'}
              strokeWidth={activeFinger?.id === 'left-middle' ? '2.5' : '1'}
              style={{
                transition: 'all 0.15s ease',
                filter: activeFinger?.id === 'left-middle' ? 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.8))' : 'none',
              }}
            />
            <text x="100" y="60" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">M</text>

            {/* Left Index */}
            <rect
              x="120"
              y="30"
              width="20"
              height="80"
              rx="10"
              fill={activeFinger?.id === 'left-index' ? FINGER_DATA['left-index'].color : '#1e293b'}
              stroke={activeFinger?.id === 'left-index' ? '#ffffff' : '#334155'}
              strokeWidth={activeFinger?.id === 'left-index' ? '2.5' : '1'}
              style={{
                transition: 'all 0.15s ease',
                filter: activeFinger?.id === 'left-index' ? 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.8))' : 'none',
              }}
            />
            <text x="130" y="70" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">I</text>

            {/* Left Thumb */}
            <rect
              x="152"
              y="75"
              width="20"
              height="55"
              rx="10"
              transform="rotate(28 152 75)"
              fill={activeFinger?.id === 'thumb' ? FINGER_DATA.thumb.color : '#1e293b'}
              stroke={activeFinger?.id === 'thumb' ? '#ffffff' : '#334155'}
              strokeWidth={activeFinger?.id === 'thumb' ? '2.5' : '1'}
              style={{
                transition: 'all 0.15s ease',
                filter: activeFinger?.id === 'thumb' ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))' : 'none',
              }}
            />
            <text x="175" y="105" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">T</text>
          </svg>
          <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.7rem' }}>
            <span style={{ color: FINGER_DATA['left-pinky'].color, fontWeight: 600 }}>Pinky (A)</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: FINGER_DATA['left-ring'].color, fontWeight: 600 }}>Ring (S)</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: FINGER_DATA['left-middle'].color, fontWeight: 600 }}>Mid (D)</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: FINGER_DATA['left-index'].color, fontWeight: 600 }}>Index (F)</span>
          </div>
        </div>

        {/* Right Hand Diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Right Hand (J K L ;)
          </div>
          <svg width="240" height="150" viewBox="0 0 240 150" fill="none" style={{ maxWidth: '100%' }}>
            {/* Palm base */}
            <path
              d="M 55 145 C 55 95, 80 85, 120 85 C 160 85, 190 90, 190 145 Z"
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="2"
            />

            {/* Right Thumb */}
            <rect
              x="68"
              y="85"
              width="20"
              height="55"
              rx="10"
              transform="rotate(-28 68 85)"
              fill={activeFinger?.id === 'thumb' ? FINGER_DATA.thumb.color : '#1e293b'}
              stroke={activeFinger?.id === 'thumb' ? '#ffffff' : '#334155'}
              strokeWidth={activeFinger?.id === 'thumb' ? '2.5' : '1'}
              style={{
                transition: 'all 0.15s ease',
                filter: activeFinger?.id === 'thumb' ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))' : 'none',
              }}
            />
            <text x="65" y="105" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">T</text>

            {/* Right Index */}
            <rect
              x="100"
              y="30"
              width="20"
              height="80"
              rx="10"
              fill={activeFinger?.id === 'right-index' ? FINGER_DATA['right-index'].color : '#1e293b'}
              stroke={activeFinger?.id === 'right-index' ? '#ffffff' : '#334155'}
              strokeWidth={activeFinger?.id === 'right-index' ? '2.5' : '1'}
              style={{
                transition: 'all 0.15s ease',
                filter: activeFinger?.id === 'right-index' ? 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.8))' : 'none',
              }}
            />
            <text x="110" y="70" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">I</text>

            {/* Right Middle */}
            <rect
              x="130"
              y="18"
              width="20"
              height="90"
              rx="10"
              fill={activeFinger?.id === 'right-middle' ? FINGER_DATA['right-middle'].color : '#1e293b'}
              stroke={activeFinger?.id === 'right-middle' ? '#ffffff' : '#334155'}
              strokeWidth={activeFinger?.id === 'right-middle' ? '2.5' : '1'}
              style={{
                transition: 'all 0.15s ease',
                filter: activeFinger?.id === 'right-middle' ? 'drop-shadow(0 0 8px rgba(45, 212, 191, 0.8))' : 'none',
              }}
            />
            <text x="140" y="60" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">M</text>

            {/* Right Ring */}
            <rect
              x="158"
              y="32"
              width="19"
              height="80"
              rx="9.5"
              fill={activeFinger?.id === 'right-ring' ? FINGER_DATA['right-ring'].color : '#1e293b'}
              stroke={activeFinger?.id === 'right-ring' ? '#ffffff' : '#334155'}
              strokeWidth={activeFinger?.id === 'right-ring' ? '2.5' : '1'}
              style={{
                transition: 'all 0.15s ease',
                filter: activeFinger?.id === 'right-ring' ? 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.8))' : 'none',
              }}
            />
            <text x="168" y="70" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">R</text>

            {/* Right Pinky */}
            <rect
              x="187"
              y="55"
              width="18"
              height="65"
              rx="9"
              fill={activeFinger?.id === 'right-pinky' ? FINGER_DATA['right-pinky'].color : '#1e293b'}
              stroke={activeFinger?.id === 'right-pinky' ? '#ffffff' : '#334155'}
              strokeWidth={activeFinger?.id === 'right-pinky' ? '2.5' : '1'}
              style={{
                transition: 'all 0.15s ease',
                filter: activeFinger?.id === 'right-pinky' ? 'drop-shadow(0 0 8px rgba(192, 132, 252, 0.8))' : 'none',
              }}
            />
            <text x="196" y="90" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">P</text>
          </svg>
          <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.7rem' }}>
            <span style={{ color: FINGER_DATA['right-index'].color, fontWeight: 600 }}>Index (J)</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: FINGER_DATA['right-middle'].color, fontWeight: 600 }}>Mid (K)</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: FINGER_DATA['right-ring'].color, fontWeight: 600 }}>Ring (L)</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: FINGER_DATA['right-pinky'].color, fontWeight: 600 }}>Pinky (;)</span>
          </div>
        </div>
      </div>

      {/* Row Guidance Selector Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'all', label: 'All Keys' },
            { id: 'home', label: 'Home Row (ASDF JKL;)' },
            { id: 'top', label: 'Top Row (QWERTY)' },
            { id: 'bottom', label: 'Bottom Row (ZXCVBNM)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRowTab(tab.id as any)}
              style={{
                background: activeRowTab === tab.id ? 'var(--brand-primary)' : 'rgba(255, 255, 255, 0.04)',
                color: activeRowTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                border: activeRowTab === tab.id ? '1px solid var(--brand-cyan)' : '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Click any keycap to inspect finger assignment
        </span>
      </div>

      {/* On-Screen Color-Coded Keyboard Layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          padding: '0.75rem',
          background: '#070d1e',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.75rem',
          overflowX: 'auto',
        }}
      >
        {KEYBOARD_LAYOUT_ROWS.map((row, rIdx) => {
          // Row filtering if tab is selected
          if (activeRowTab === 'home' && rIdx !== 2) return null;
          if (activeRowTab === 'top' && rIdx !== 1) return null;
          if (activeRowTab === 'bottom' && rIdx !== 3) return null;

          return (
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
                const finger = FINGER_DATA[kItem.finger];
                const isTarget =
                  normalizedInspected === kItem.key.toLowerCase() ||
                  (inspectedChar === ' ' && kItem.key === ' ');

                return (
                  <button
                    key={kItem.key}
                    onClick={() => {
                      setSelectedKey(kItem.key);
                      if (onSelectKeyToPractice && kItem.key.length === 1) {
                        onSelectKeyToPractice(kItem.key);
                      }
                    }}
                    style={{
                      flex: kItem.width || 1,
                      minWidth: '32px',
                      height: '38px',
                      borderRadius: '6px',
                      background: isTarget
                        ? finger.color
                        : 'rgba(15, 23, 42, 0.9)',
                      border: isTarget
                        ? '2px solid #ffffff'
                        : `1px solid ${finger ? finger.color + '44' : 'var(--border-subtle)'}`,
                      color: isTarget ? '#070d1e' : '#f8fafc',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: isTarget || kItem.isHomeAnchor ? 800 : 600,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: isTarget
                        ? `0 0 14px ${finger.color}`
                        : '0 2px 4px rgba(0, 0, 0, 0.25)',
                      transform: isTarget ? 'scale(1.06)' : 'none',
                      transition: 'all 0.12s cubic-bezier(0.2, 0, 0, 1)',
                    }}
                    title={`${kItem.display}: ${finger ? finger.name : 'Key'}`}
                  >
                    <span>{kItem.display}</span>
                    {/* Home row tactile bump indicator for F and J */}
                    {kItem.isHomeAnchor && (
                      <span
                        style={{
                          width: '10px',
                          height: '2px',
                          borderRadius: '1px',
                          backgroundColor: isTarget ? '#070d1e' : finger.color,
                          marginTop: '2px',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Touch Typing Rule of Thumb Checklist */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: '#10b981' }}>✓</span>
          <span><strong>Home Row anchor:</strong> Fingers rest on A S D F and J K L ;</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: '#10b981' }}>✓</span>
          <span><strong>Never cross midline:</strong> Left hand stays left, right stays right</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: '#10b981' }}>✓</span>
          <span><strong>F & J bumps:</strong> Index fingers return to F and J after each reach</span>
        </div>
      </div>
    </div>
  );
};
