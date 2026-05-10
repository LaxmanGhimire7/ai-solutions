const router = require('express').Router();

router.use('/admin', require('./admin.routes'));
router.use('/inquiries', require('./inquiry.routes'));
router.use('/chatbot', require('./chatbot.routes'));
router.use('/articles', require('./article.routes'));
router.use('/events', require('./event.routes'));
router.use('/gallery', require('./gallery.routes'));
router.use('/testimonials', require('./testimonial.routes'));

// Chat REST endpoints (sessions list/detail for admin)
const chatRoutes = require('./chat.routes');
router.use('/chat', chatRoutes.router);

module.exports = router;
module.exports.chatService = chatRoutes.chatService;
