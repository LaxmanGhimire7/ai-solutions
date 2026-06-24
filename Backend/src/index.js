const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const socketUtil = require('./utils/socket');
const emailUtil = require('./utils/email');

const app = express();
const server = http.createServer(app);
const enableRealtimeChat = process.env.ENABLE_REALTIME_CHAT === 'true';
const normaliseOrigin = (origin) => origin.trim().replace(/\/+$/, '');
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(normaliseOrigin)
  .filter(Boolean);

if (enableRealtimeChat) {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  socketUtil.init(io);
  const { chatService } = routes;

  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (['admin', 'superadmin'].includes(decoded.role)) {
          socket.data.admin = decoded;
        }
      } catch (err) {
        socket.data.authError = err.message;
      }
    }

    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_admin', (ack) => {
      if (!socket.data.admin) {
        const response = { success: false, message: 'Admin authentication required' };
        socket.emit('support_error', response);
        if (typeof ack === 'function') ack(response);
        return;
      }

      socket.join('admin_room');
      io.emit('support_presence', { online: true });
      if (typeof ack === 'function') ack({ success: true });
    });

    socket.on('start_chat', async (data = {}, ack) => {
      try {
        const session = await chatService.startSession({
          socketId: socket.id,
          sessionId: data.sessionId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
        });

        socket.data.chatSessionId = String(session._id);
        socket.join(`chat:${session._id}`);

        const response = {
          success: true,
          sessionId: session._id,
          session,
          supportOnline: socketUtil.roomSize('admin_room') > 0,
        };
        socket.emit('chat_started', response);
        io.to('admin_room').emit('new_chat_session', {
          ...session,
          messages: undefined,
        });
        if (typeof ack === 'function') ack(response);
      } catch (err) {
        const response = { success: false, message: err.message };
        socket.emit('support_error', response);
        if (typeof ack === 'function') ack(response);
      }
    });

    socket.on('customer_message', async (data = {}, ack) => {
      try {
        const sessionId = data.sessionId || socket.data.chatSessionId;
        if (!sessionId || String(sessionId) !== String(socket.data.chatSessionId)) {
          throw new Error('Start a chat session before sending messages');
        }

        const result = await chatService.handleCustomerMessage({
          sessionId,
          socketId: socket.id,
          content: data.content,
        });
        if (typeof ack === 'function') {
          ack({
            success: true,
            message: result.message,
            autoReply: result.autoReply,
          });
        }
      } catch (err) {
        const response = { success: false, message: err.message };
        socket.emit('support_error', response);
        if (typeof ack === 'function') ack(response);
      }
    });

    socket.on('admin_reply', async (data = {}, ack) => {
      try {
        if (!socket.data.admin) {
          const authError = new Error('Admin authentication required');
          authError.statusCode = 401;
          throw authError;
        }

        const response = await chatService.handleAdminReply({
          sessionId: data.sessionId,
          content: data.content,
        });
        if (typeof ack === 'function') ack({ success: true, ...response });
      } catch (err) {
        const response = { success: false, message: err.message };
        socket.emit('support_error', response);
        if (typeof ack === 'function') ack(response);
      }
    });

    socket.on('mark_chat_read', async (data = {}) => {
      if (!socket.data.admin || !data.sessionId) return;
      await chatService.getSessionById(data.sessionId).catch(() => null);
      io.to('admin_room').emit('chat_read', { sessionId: data.sessionId });
    });

    socket.on('submit_chat_rating', async (data = {}, ack) => {
      try {
        const sessionId = data.sessionId || socket.data.chatSessionId;
        if (!sessionId || String(sessionId) !== String(socket.data.chatSessionId)) {
          throw new Error('Chat session could not be verified');
        }

        const session = await chatService.submitRating(
          sessionId,
          data.rating,
          data.ratingComment
        );
        const response = {
          success: true,
          rating: session.rating,
          ratingComment: session.ratingComment,
          ratedAt: session.ratedAt,
        };
        socket.emit('rating_saved', response);
        if (typeof ack === 'function') ack(response);
      } catch (err) {
        const response = { success: false, message: err.message };
        socket.emit('support_error', response);
        if (typeof ack === 'function') ack(response);
      }
    });

    socket.on('disconnect', async () => {
      if (socket.data.admin) {
        io.emit('support_presence', {
          online: socketUtil.roomSize('admin_room') > 0,
        });
      }

      if (!socket.data.chatSessionId) return;
      await chatService
        .setPresence(socket.data.chatSessionId, false)
        .catch((err) => console.error('Chat presence error:', err.message));
    });
  });
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(normaliseOrigin(origin))) {
      return callback(null, true);
    }

    const error = new Error(`Origin ${origin} is not allowed by CORS`);
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, statusCode: 429, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    realtimeChat: enableRealtimeChat,
    email: emailUtil.getStatus(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, statusCode: 404, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
  console.error(
    'Missing MONGODB_URI. Add it to Backend/.env using MONGODB_URI=your_connection_string'
  );
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await emailUtil.verify().catch((err) => {
      console.error('[email] SMTP verification failed:', err.message);
    });
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = { app, server };
