const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class ChatController {
  constructor(chatService) {
    this.service = chatService;
    this.getSessions = this.getSessions.bind(this);
    this.getSessionById = this.getSessionById.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.deleteConversation = this.deleteConversation.bind(this);
  }

  /**
   * GET /api/chat/sessions
   * Admin only — list all chat sessions
   */
  getSessions = asyncHandler(async (req, res) => {
    const result = await this.service.getSessions(req.query);
    res.status(200).json(
      ApiResponse.paginated(result.data, {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      }, 'Sessions fetched')
    );
  });

  /**
   * GET /api/chat/sessions/:id
   * Admin only — full session with messages
   */
  getSessionById = asyncHandler(async (req, res) => {
    const session = await this.service.getSessionById(req.params.id);
    res.status(200).json(ApiResponse.success(session, 'Session fetched'));
  });

  updateStatus = asyncHandler(async (req, res) => {
    const session = await this.service.updateStatus(req.params.id, req.body.status);
    res.status(200).json(ApiResponse.success(session, 'Chat status updated'));
  });

  deleteConversation = asyncHandler(async (req, res) => {
    await this.service.deleteConversation(req.params.id);
    res.status(200).json(ApiResponse.success({}, 'Conversation deleted'));
  });
}

module.exports = ChatController;
