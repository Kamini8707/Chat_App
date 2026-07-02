import React from 'react';
import { X, Users, MessageSquare } from 'lucide-react';

export default function UserList({ users, onClose, currentUserId }) {
  return (
    <div style={styles.overlay} onClick={onClose} className="animate-fade-in">
      <div 
        style={styles.container} 
        onClick={(e) => e.stopPropagation()} 
        className="animate-slide-in"
      >
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <Users size={20} color="var(--primary)" />
            <span>Online Realms ({users.length})</span>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.list}>
          {users.length === 0 ? (
            <div style={styles.emptyState}>No users online</div>
          ) : (
            users.map((user) => {
              const isSelf = user.id === currentUserId;
              const firstChar = user.username ? user.username.charAt(0).toUpperCase() : '?';

              return (
                <div key={user.id} style={styles.userCard}>
                  <div style={styles.avatarWrapper}>
                    <div style={{ ...styles.avatar, background: user.avatar }}>
                      {firstChar}
                    </div>
                    <div style={styles.statusDot} />
                  </div>
                  
                  <div style={styles.userInfo}>
                    <div style={styles.username}>
                      {user.username}
                      {isSelf && <span style={styles.selfBadge}>You</span>}
                    </div>
                    <div style={styles.statusText}>Connected</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={styles.footer}>
          <MessageSquare size={14} style={{ opacity: 0.5 }} />
          <span>Real-time communication active</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 4, 15, 0.65)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  container: {
    width: '80%',
    maxWidth: '320px',
    height: '100%',
    background: 'rgba(15, 12, 30, 0.95)',
    borderRight: '1px solid var(--glass-border)',
    boxShadow: '10px 0 30px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 20px',
    borderBottom: '1px solid var(--glass-border)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '700',
    fontSize: '1.1rem',
    color: '#fff',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--glass-text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  emptyState: {
    textAlign: 'center',
    color: 'var(--glass-text-muted)',
    padding: '40px 0',
    fontSize: '0.9rem',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid transparent',
    transition: 'all 0.2s',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '700',
    color: 'white',
    fontSize: '0.85rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },
  statusDot: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'var(--accent-green)',
    border: '2px solid rgba(15, 12, 30, 0.95)',
  },
  userInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  username: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  selfBadge: {
    fontSize: '0.65rem',
    background: 'var(--primary)',
    color: 'white',
    padding: '1px 6px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: '0.75rem',
    color: 'var(--glass-text-muted)',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.75rem',
    color: 'var(--glass-text-muted)',
  }
};
