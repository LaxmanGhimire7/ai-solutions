require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const socketUtil = require('./utils/socket');
const emailUtil = require('./utils/email');

const app = express();
const server = http.createServer(app);
const enableRealtimeChat = process.env.ENABLE_REALTIME_CHAT === 'true';
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (enableRealtimeChat) {
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

socketUtil.init(io);

const { chatService } = routes;

io.on('connection', (socket) => {
  console.log('🔌 Client connected: ' + socket.id);

  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log('👤 Admin joined admin_room: ' + socket.id);
  });

  socket.on('start_chat', async (data) => {
    try {
      const session = await chatService.startSession({
        socketId: socket.id,
        customerName: data && data.customerName,
        customerEmail: data && data.customerEmail,
      });
      socket.emit('chat_started', { sessionId: session._id });
      io.to('admin_room').emit('new_chat_session', {
        sessionId: session._id,
        socketId: socket.id,
        customerName: session.customerName,
        customerEmail: session.customerEmail,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('start_chat error:', err.message);
    }
  });

  socket.on('customer_message', async (data) => {
    try {
      await chatService.handleCustomerMessage({
        socketId: socket.id,
        content: data && data.content,
      });
    } catch (err) {
      console.error('customer_message error:', err.message);
    }
  });

  socket.on('admin_reply', async (data) => {
    try {
      await chatService.handleAdminReply({
        sessionId: data && data.sessionId,
        targetSocketId: data && data.targetSocketId,
        content: data && data.content,
      });
    } catch (err) {
      console.error('admin_reply error:', err.message);
    }
  });

  socket.on('disconnect', async () => {
    console.log('🔌 Disconnected: ' + socket.id);
    try {
      await chatService.closeSession(socket.id);
      io.to('admin_room').emit('chat_closed', { socketId: socket.id });
    } catch (err) {
      // session may not exist
    }
  });
});
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
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
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, statusCode: 404, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await emailUtil.verify().catch((err) => {
      console.error('[email] SMTP verification failed:', err.message);
    });
    server.listen(PORT, () => {
      console.log('🚀 Server running on http://localhost:' + PORT);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = { app, server };
