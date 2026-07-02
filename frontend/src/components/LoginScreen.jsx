import React, { useState } from 'react';
import { Shield } from 'lucide-react';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', // Indigo
  'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)', // Cyan
  'linear-gradient(135deg, #059669 0%, #10b981 100%)', // Emerald
  'linear-gradient(135deg, #dc2626 0%, #f43f5e 100%)', // Rose
  'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', // Amber
  'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', // Blue
];

export default function LoginScreen({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    if (username.length > 15) {
      setError('Username must be 15 characters or less');
      return;
    }

    setIsLoading(true);
    setError('');

    const backendBase = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : `${window.location.protocol}//${window.location.hostname}:3001`;

    const endpoint = isRegistering ? '/api/register' : '/api/login';
    const payload = isRegistering 
      ? { username: username.trim(), password, avatar: selectedAvatar }
      : { username: username.trim(), password };

    try {
      const response = await fetch(`${backendBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Success! Pass data to parent App.jsx
      onLogin({ username: data.username, avatar: data.avatar });
    } catch (err) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen animate-fade-in" style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <Shield size={24} color="#fff" />
          </div>
          <h1 style={styles.title}>RealTalk</h1>
          <p style={styles.subtitle}>
            {isRegistering ? 'Create a secure messaging identity' : 'Secure real-time communication portal'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputsWrapper}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="glass-input"
              disabled={isLoading}
              autoFocus
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="glass-input"
              disabled={isLoading}
            />

            {error && <span style={styles.errorText}>{error}</span>}
          </div>

          {/* Show avatar picker ONLY on registration */}
          {isRegistering && (
            <div style={styles.avatarSection}>
              <label style={styles.label}>Select Profile Identity</label>
              <div style={styles.avatarGrid}>
                {AVATAR_COLORS.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAvatar(color)}
                    style={{
                      ...styles.avatarOption,
                      background: color,
                      border: selectedAvatar === color ? '2px solid #fff' : '2px solid transparent',
                      outline: 'none',
                    }}
                    disabled={isLoading}
                  >
                    {username ? username.charAt(0).toUpperCase() : '?'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="glass-btn primary" 
            style={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isRegistering ? 'Create Account' : 'Start Session'}
          </button>
        </form>

        <div style={styles.toggleMode}>
          <span style={styles.toggleLabel}>
            {isRegistering ? 'Already have an identity?' : "Don't have an identity?"}
          </span>
          <button 
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setUsername('');
              setPassword('');
            }}
            style={styles.toggleBtn}
            disabled={isLoading}
          >
            {isRegistering ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>

      <div style={styles.footer}>
        Enterprise Grade Real-Time Relay Engine
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    height: '100%',
    backgroundColor: '#09090b',
  },
  card: {
    width: '100%',
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    backgroundColor: '#4f46e5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#f4f4f5',
    marginBottom: '6px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#a1a1aa',
    lineHeight: '1.3',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    paddingBottom: '8px',
  },
  errorText: {
    position: 'absolute',
    bottom: '-12px',
    left: '2px',
    fontSize: '0.7rem',
    color: '#ef4444',
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#71717a',
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
  },
  avatarOption: {
    height: '38px',
    borderRadius: '50%',
    cursor: 'pointer',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.1s ease',
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  toggleMode: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
  },
  toggleLabel: {
    color: '#71717a',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    padding: '2px 4px',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '0.7rem',
    color: '#3f3f46',
    letterSpacing: '0.5px',
  }
};
