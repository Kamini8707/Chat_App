import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import ChatArea from './components/ChatArea';
import UserList from './components/UserList';

// Synthesize premium UI notification sounds using the Web Audio API
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'sent') {
      // Light high-pitched synth click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'received') {
      // Soft pleasant double-tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.06); // E5
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch (err) {
    console.warn('Audio synthesis disabled by browser autoplay restriction', err);
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [showUsers, setShowUsers] = useState(false);
  const socketRef = useRef(null);

  // Connect to socket once user logs in
  useEffect(() => {
    if (!user) return;

    // Dynamically derive backend port 3001 relative to Vite port 5173, or use root origin in production
    const backendUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : window.location.origin;

    const socketInstance = io(backendUrl, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Connection events
    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit('join', { username: user.username, avatar: user.avatar });
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    // Chat messages broker
    socketInstance.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      
      // Play sounds based on sender identity
      if (msg.sender && !msg.sender.isSystem) {
        if (msg.sender.id === socketInstance.id) {
          playSound('sent');
        } else {
          playSound('received');
        }
      }
    });

    // Active user updates
    socketInstance.on('user_list', (users) => {
      setOnlineUsers(users);
    });

    // Typing activity updates
    socketInstance.on('user_typing', ({ id, username, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [id]: { username, isTyping }
      }));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Dispatch outgoing message
  const handleSendMessage = (text) => {
    if (socket && isConnected) {
      socket.emit('send_message', text);
    }
  };

  // Dispatch typing status
  const handleTypingStatus = (isTyping) => {
    if (socket && isConnected) {
      socket.emit('typing_status', { isTyping });
    }
  };

  return (
    <div className="app-container">
      {!user ? (
        <LoginScreen onLogin={setUser} />
      ) : (
        <>
          <ChatArea
            messages={messages}
            onSendMessage={handleSendMessage}
            onTypingStatus={handleTypingStatus}
            typingUsers={typingUsers}
            onToggleUsers={() => setShowUsers(!showUsers)}
            isConnected={isConnected}
            currentUserId={socket ? socket.id : null}
          />

          {showUsers && (
            <UserList
              users={onlineUsers}
              onClose={() => setShowUsers(false)}
              currentUserId={socket ? socket.id : null}
            />
          )}
        </>
      )}
    </div>
  );
}
