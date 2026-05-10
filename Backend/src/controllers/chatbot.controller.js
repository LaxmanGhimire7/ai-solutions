const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class ChatbotController {
  constructor(chatbotService) {
    this.service = chatbotService;
    this.message = this.message.bind(this);
    this.getFaqs = this.getFaqs.bind(this);
  }

  /**
   * POST /api/chatbot/message
   * Public — accepts a user message, returns rule-based response
   */
  message = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const response = this.service.getResponse(message);
    res.status(200).json(ApiResponse.success(response, 'Response generated'));
  });

  /**
   * GET /api/chatbot/faqs
   * Public — returns list of FAQ questions for quick-reply buttons
   */
  getFaqs = asyncHandler(async (req, res) => {
    const faqs = this.service.getFaqs();
    res.status(200).json(ApiResponse.success(faqs, 'FAQs fetched'));
  });
}

module.exports = ChatbotController;
