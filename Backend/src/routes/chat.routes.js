const router = require('express').Router();

const ChatSessionModel = require('../models/ChatSession.model');
const ChatSessionRepository = require('../repositories/chatSession.repository');
const ChatService = require('../services/chat.service');
const ChatController = require('../controllers/chat.controller');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const socketUtil = require('../utils/socket');

const chatRepo = new ChatSessionRepository(ChatSessionModel);
const chatService = new ChatService(chatRepo, socketUtil);
const chatController = new ChatController(chatService);

// Export service so index.js can wire Socket.io events
module.exports.chatService = chatService;

// Admin REST endpoints
router.get('/sessions', authenticateAdmin, chatController.getSessions);
router.get('/sessions/:id', authenticateAdmin, chatController.getSessionById);

module.exports.router = router;
