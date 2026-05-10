const router = require('express').Router();
const rateLimit = require('express-rate-limit');

const chatbotService = require('../services/chatbot.service');
const ChatbotController = require('../controllers/chatbot.controller');
const { messageSchema, validate } = require('../validators/chatbot.validator');

const chatbotController = new ChatbotController(chatbotService);

// Rate limit: 60 messages per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, statusCode: 429, message: 'Too many messages. Slow down.' },
});

router.post('/message', chatLimiter, validate(messageSchema), chatbotController.message);
router.get('/faqs', chatbotController.getFaqs);

module.exports = router;
