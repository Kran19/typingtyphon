'use client';

import React, { useState } from 'react';
import { UserProfileDto, GuestSessionMigrationItem } from '@typingtyphon/contracts';
import { markGuestSessionsMigrated } from '../lib/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfileDto | null;
  onAuthSuccess: (user: UserProfileDto) => void;
  onLogout: () => void;
  guestSessions: GuestSessionMigrationItem[];
  onRefreshGuestData: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
  guestSessions,
  onRefreshGuestData,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Migration status
  const [migrationStatus, setMigrationStatus] = useState<{
    migrating: boolean;
    result?: { migratedCount: number; duplicateCount: number; skippedCount: number };
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

  const unmigrated = guestSessions.filter((s) => !s.isMigrated);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const endpoint = tab === 'register' ? `${apiUrl}/auth/register` : `${apiUrl}/auth/login`;
      const payload =
        tab === 'register'
          ? { email, username, password, fullName: fullName.trim() || undefined }
          : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication request failed.');
      }

      if (data.user) {
        onAuthSuccess(data.user);
        // If there are no unmigrated sessions, close immediately
        if (unmigrated.length === 0) {
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to authentication server. Practice is still fully available as a guest.');
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    setMigrationStatus({ migrating: true });
    try {
      const res = await fetch(`${apiUrl}/progress/migrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ guestSessions: unmigrated }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Migration request failed.');
      }

      if (data.migratedIds && Array.isArray(data.migratedIds)) {
        await markGuestSessionsMigrated(data.migratedIds);
        onRefreshGuestData();
      }

      setMigrationStatus({
        migrating: false,
        result: {
          migratedCount: data.migratedCount || 0,
          duplicateCount: data.duplicateCount || 0,
          skippedCount: data.skippedCount || 0,
        },
      });
    } catch (err: any) {
      setMigrationStatus({
        migrating: false,
        error: err.message || 'Network error during migration. Your local records were not modified.',
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '1.25rem',
          padding: '2rem 2.5rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* If user is logged in, show account info and migration options */}
        {currentUser ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👤</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentUser.username}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentUser.email}</p>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38BDF8',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontWeight: 600,
                }}
              >
                Role: {currentUser.role}
              </div>
            </div>

            {/* Migration Prompt if unmigrated sessions exist */}
            {unmigrated.length > 0 && !migrationStatus?.result && (
              <div
                style={{
                  background: 'rgba(2, 132, 199, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#38BDF8', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  ☁️ Local History Migration
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  You have {unmigrated.length} unmigrated guest practice session(s) saved on this browser. Would you like to sync them to your cloud account?
                </div>
                {migrationStatus?.error && (
                  <div style={{ color: 'var(--char-incorrect)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    ⚠️ {migrationStatus.error}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleMigrate}
                    disabled={migrationStatus?.migrating}
                    style={{
                      background: 'var(--char-correct)',
                      color: '#0F172A',
                      fontWeight: 700,
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {migrationStatus?.migrating ? 'Syncing...' : 'Sync History Now'}
                  </button>
                  <button
                    onClick={onClose}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.8rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Keep Local Only
                  </button>
                </div>
              </div>
            )}

            {migrationStatus?.result && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  color: '#10B981',
                }}
              >
                ✓ Migration complete: {migrationStatus.result.migratedCount} new session(s) synchronized.
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={onLogout}
                style={{
                  flex: 1,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  color: '#EF4444',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Form */
          <div>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <button
                onClick={() => { setTab('register'); setErrorMessage(null); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: tab === 'register' ? '2px solid var(--char-correct)' : '2px solid transparent',
                  color: tab === 'register' ? 'var(--char-correct)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                Create Account
              </button>
              <button
                onClick={() => { setTab('login'); setErrorMessage(null); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: tab === 'login' ? '2px solid var(--char-correct)' : '2px solid transparent',
                  color: tab === 'login' ? 'var(--char-correct)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            </div>

            {errorMessage && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  color: '#EF4444',
                  borderRadius: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                }}
              >
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="typist@example.com"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              {tab === 'register' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="speedy_typist"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '0.5rem',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ada Lovelace"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '0.5rem',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'Processing...' : tab === 'register' ? 'Register Account' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>

            <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              🔒 Practice is always free and optional. Guest history remains on your device until migrated.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
