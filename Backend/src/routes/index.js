const router = require('express').Router();

router.use('/admin', require('./admin.routes'));
router.use('/auth', require('./admin.routes'));
router.use('/inquiries', require('./inquiry.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/uploads', require('./upload.routes'));
router.use('/chatbot', require('./chatbot.routes'));
router.use('/content', require('./content.routes'));
router.use('/services', require('./service.routes'));
router.use('/projects', require('./project.routes'));
router.use('/articles', require('./article.routes'));
router.use('/events', require('./event.routes'));
router.use('/gallery', require('./gallery.routes'));
router.use('/testimonials', require('./testimonial.routes'));

const chatRoutes = require('./chat.routes');
if (process.env.ENABLE_REALTIME_CHAT === 'true') {
  router.use('/chat', chatRoutes.router);
}

module.exports = router;
module.exports.chatService = chatRoutes.chatService;
