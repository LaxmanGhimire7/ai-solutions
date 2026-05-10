const router = require('express').Router();

const EventModel = require('../models/Event.model');
const ContentRepository = require('../repositories/content.repository');
const ContentService = require('../services/content.service');
const ContentController = require('../controllers/content.controller');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { eventCreate, eventUpdate, contentQuery, validate } = require('../validators/content.validator');

const repo = new ContentRepository(EventModel);
const service = new ContentService(repo, { hasSlug: false });
const controller = new ContentController(service);

// Public
router.get('/', validate(contentQuery, 'query'), controller.getAll);
router.get('/:id', controller.getById);

// Admin
router.get('/admin/all', authenticateAdmin, validate(contentQuery, 'query'), controller.getAllAdmin);
router.post('/', authenticateAdmin, validate(eventCreate), controller.create);
router.put('/:id', authenticateAdmin, validate(eventUpdate), controller.update);
router.delete('/:id', authenticateAdmin, controller.delete);

module.exports = router;
