const router = require('express').Router();

router.use('/services', require('./service.routes'));
router.use('/projects', require('./project.routes'));
router.use('/testimonials', require('./testimonial.routes'));
router.use('/articles', require('./article.routes'));
router.use('/events', require('./event.routes'));
router.use('/gallery', require('./gallery.routes'));

module.exports = router;
