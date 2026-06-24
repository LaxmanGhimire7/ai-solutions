const router = require('express').Router();

const ChatSessionModel = require('../models/ChatSession.model');
const ChatSessionRepository = require('../repositories/chatSession.repository');
const ChatService = require('../services/chat.service');
const ChatController = require('../controllers/chat.controller');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const validateObjectId = require('../middleware/validateObjectId');
const socketUtil = require('../utils/socket');

const chatRepo = new ChatSessionRepository(ChatSessionModel);
const chatService = new ChatService(chatRepo, socketUtil);
const chatController = new ChatController(chatService);

// Admin REST endpoints
router.get('/sessions', authenticateAdmin, chatController.getSessions);
router.get('/sessions/:id', authenticateAdmin, validateObjectId(), chatController.getSessionById);
router.patch('/sessions/:id/status', authenticateAdmin, validateObjectId(), chatController.updateStatus);
router.delete('/sessions/:id', authenticateAdmin, validateObjectId(), chatController.deleteConversation);

module.exports = { router, chatService };
