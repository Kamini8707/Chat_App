import React, { useState, useEffect, useRef } from 'react';
import { Send, Menu, Users, Wifi, WifiOff, Smile } from 'lucide-react';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

export default function ChatArea({ 
  messages, 
  onSendMessage, 
  onTypingStatus, 
  typingUsers, 
  onToggleUsers, 
  isConnected,
  currentUserId
}) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    onTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTypingStatus(false);
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim());
    setInputText('');
    
    onTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const sendEmoji = (emoji) => {
    onSendMessage(emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Sleek SaaS Header */}
      <div style={styles.header}>
        <button onClick={onToggleUsers} style={styles.iconBtn} title="View Online Users">
          <Menu size={18} />
        </button>

        <div style={styles.headerTitle}>
          <span style={styles.titleText}>RealTalk Room</span>
          <div style={styles.statusIndicator}>
            {isConnected ? (
              <>
                <div style={styles.onlineDot} />
                <span style={styles.statusText}>Active</span>
              </>
            ) : (
              <>
                <div style={styles.offlineDot} />
                <span style={{ ...styles.statusText, color: 'var(--accent-red)' }}>Offline</span>
              </>
            )}
          </div>
        </div>

        <button onClick={onToggleUsers} style={styles.iconBtn} title="View Online Users">
          <Users size={18} />
        </button>
      </div>

      {/* Message Feed */}
      <div style={styles.feed}>
        {messages.length === 0 ? (
          <div style={styles.emptyFeed}>
            <div style={styles.emptyFeedPill}>
              Secure session started. Write a message to begin.
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender.isSystem) {
              return (
                <div key={msg.id} style={styles.systemMessageContainer}>
                  <span style={styles.systemMessagePill}>{msg.text}</span>
                </div>
              );
            }

            const isSelf = msg.sender.id === currentUserId;
            const initials = msg.sender.username ? msg.sender.username.charAt(0).toUpperCase() : '?';

            return (
              <div 
                key={msg.id} 
                style={{
                  ...styles.messageRow,
                  justifyContent: isSelf ? 'flex-end' : 'flex-start'
                }}
              >
                {!isSelf && (
                  <div style={{ ...styles.messageAvatar, background: msg.sender.avatar }}>
                    {initials}
                  </div>
                )}

                <div style={styles.messageBubbleContainer}>
                  {!isSelf && <div style={styles.messageSender}>{msg.sender.username}</div>}
                  <div 
                    style={{
                      ...styles.messageBubble,
                      backgroundColor: isSelf ? 'var(--bubble-self)' : 'var(--bubble-other)',
                      borderTopRightRadius: isSelf ? '2px' : '12px',
                      borderTopLeftRadius: isSelf ? '12px' : '2px',
                    }}
                  >
                    <div style={styles.messageText}>{msg.text}</div>
                    <div style={styles.messageMeta}>
                      <span style={styles.messageTime}>{formatTime(msg.timestamp)}</span>
                      {isSelf && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 5L9.5 12.5L6 9" />
                          <path d="M22 5L14.5 12.5" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing State */}
        {Object.values(typingUsers).some(u => u.isTyping) && (
          <div style={styles.typingRow}>
            <div style={styles.typingBubble}>
              <div className="typing-dots">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <span style={styles.typingText}>
                {Object.values(typingUsers)
                  .filter(u => u.isTyping)
                  .map(u => u.username)
                  .join(', ')} typing
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Panel */}
      {showEmojiPicker && (
        <div style={styles.emojiContainer} className="animate-fade-in">
          {EMOJIS.map((emoji) => (
            <button 
              key={emoji} 
              onClick={() => sendEmoji(emoji)} 
              style={styles.emojiBtn}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Box */}
      <form onSubmit={handleSend} style={styles.inputArea}>
        <button 
          type="button" 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
          style={{
            ...styles.inputIconBtn,
            color: showEmojiPicker ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          <Smile size={18} />
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={handleInputChange}
          style={styles.inputField}
          maxLength={500}
        />

        <button type="submit" style={styles.sendBtn} disabled={!inputText.trim()} title="Send Message">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    backgroundColor: '#18181b',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#18181b',
  },
  headerTitle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  titleText: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: '#f4f4f5',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-green)',
  },
  offlineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-red)',
  },
  statusText: {
    fontSize: '0.65rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.1s ease',
  },
  feed: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#09090b',
  },
  emptyFeed: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  emptyFeedPill: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: '#18181b',
  },
  messageRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  messageAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: '600',
    color: 'white',
    fontSize: '0.75rem',
    flexShrink: 0,
  },
  messageBubbleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  messageSender: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    marginLeft: '2px',
  },
  messageBubble: {
    padding: '10px 14px',
    borderRadius: '12px',
    position: 'relative',
    minWidth: '50px',
  },
  messageText: {
    fontSize: '0.9rem',
    color: '#f4f4f5',
    lineHeight: '1.35',
    wordBreak: 'break-word',
  },
  messageMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '3px',
    marginTop: '3px',
    fontSize: '0.62rem',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  messageTime: {
    fontVariantNumeric: 'tabular-nums',
  },
  systemMessageContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    margin: '2px 0',
  },
  systemMessagePill: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    backgroundColor: '#18181b',
    border: '1px solid var(--border-color)',
    padding: '3px 10px',
    borderRadius: '6px',
  },
  typingRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '2px',
  },
  typingBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#18181b',
    border: '1px solid var(--border-color)',
    padding: '4px 10px',
    borderRadius: '8px',
  },
  typingText: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  emojiContainer: {
    position: 'absolute',
    bottom: '72px',
    left: '16px',
    right: '16px',
    backgroundColor: '#18181b',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px',
    display: 'flex',
    justifyContent: 'space-around',
    boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
    zIndex: 5,
  },
  emojiBtn: {
    fontSize: '1.2rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
    padding: '2px',
  },
  inputArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: '#18181b',
  },
  inputIconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.1s ease',
  },
  inputField: {
    flex: 1,
    backgroundColor: '#09090b',
    border: '1px solid var(--border-color)',
    color: '#f4f4f5',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    outline: 'none',
    transition: 'all 0.15s ease',
  },
  sendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'var(--primary)',
    border: 'none',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.1s ease',
  }
};
