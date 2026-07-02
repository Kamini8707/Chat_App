import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory database of registered users: { [username.toLowerCase()]: { username, password, avatar } }
const usersDb = {
  admin: { 
    username: 'admin', 
    password: 'password123', 
    avatar: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' 
  }
};

// REST API for User Registration
app.post('/api/register', (req, res) => {
  const { username, password, avatar } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const normalizedUser = username.trim();
  const key = normalizedUser.toLowerCase();

  if (usersDb[key]) {
    return res.status(400).json({ error: 'Username is already registered' });
  }

  usersDb[key] = {
    username: normalizedUser,
    password: password,
    avatar: avatar || 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
  };

  console.log(`Registered user: ${normalizedUser}`);
  res.status(201).json({ username: normalizedUser, avatar: usersDb[key].avatar });
});

// REST API for User Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const key = username.trim().toLowerCase();
  const user = usersDb[key];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  console.log(`Logged in user: ${user.username}`);
  res.json({ username: user.username, avatar: user.avatar });
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow connections from any origin (e.g. Vite frontend)
    methods: ['GET', 'POST']
  }
});

// In-memory store for online users: { [socketId]: { id, username, avatar, joinedAt } }
const onlineUsers = {};

// Simple ping endpoint for health check
app.get('/health', (req, res) => {
  res.send({ status: 'ok', onlineCount: Object.keys(onlineUsers).length });
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins with username and avatar info
  socket.on('join', ({ username, avatar }) => {
    if (!username) return;

    // Save user info
    onlineUsers[socket.id] = {
      id: socket.id,
      username: username,
      avatar: avatar || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      joinedAt: new Date().toISOString()
    };

    console.log(`${username} joined with socket ID ${socket.id}`);

    // Broadcast updated online user list to everyone
    io.emit('user_list', Object.values(onlineUsers));

    // Broadcast system join notification
    io.emit('message', {
      id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: `${username} joined the chat`,
      sender: { username: 'System', isSystem: true },
      timestamp: new Date().toISOString()
    });
  });

  // User sends a chat message
  socket.on('send_message', (messageText) => {
    const user = onlineUsers[socket.id];
    if (!user) return;

    const messagePayload = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: messageText,
      sender: {
        id: socket.id,
        username: user.username,
        avatar: user.avatar
      },
      timestamp: new Date().toISOString()
    };

    // Broadcast to all clients including sender
    io.emit('message', messagePayload);
  });

  // User typing status indicator
  socket.on('typing_status', ({ isTyping }) => {
    const user = onlineUsers[socket.id];
    if (!user) return;

    // Broadcast to everyone else that this user is typing
    socket.broadcast.emit('user_typing', {
      id: socket.id,
      username: user.username,
      isTyping
    });
  });

  // User disconnects
  socket.on('disconnect', () => {
    const user = onlineUsers[socket.id];
    if (user) {
      console.log(`${user.username} left with socket ID ${socket.id}`);
      
      const username = user.username;
      delete onlineUsers[socket.id];

      // Broadcast updated online user list
      io.emit('user_list', Object.values(onlineUsers));

      // Broadcast system left notification
      io.emit('message', {
        id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: `${username} left the chat`,
        sender: { username: 'System', isSystem: true },
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`Unregistered socket disconnected: ${socket.id}`);
    }
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets from frontend build folder in production
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Fallback all SPA routing to React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
