const router = require('express').Router();

const ArticleModel = require('../models/Article.model');
const ContentRepository = require('../repositories/content.repository');
const ContentService = require('../services/content.service');
const ContentController = require('../controllers/content.controller');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const validateObjectId = require('../middleware/validateObjectId');
const { articleCreate, articleUpdate, contentQuery, validate } = require('../validators/content.validator');

const repo = new ContentRepository(ArticleModel);
const service = new ContentService(repo, { hasSlug: true });
const controller = new ContentController(service);

// Public
router.get('/', validate(contentQuery, 'query'), controller.getAll);
router.get('/slug/:slug', controller.getBySlug);

// Admin
router.get('/admin/all', authenticateAdmin, validate(contentQuery, 'query'), controller.getAllAdmin);
router.post('/', authenticateAdmin, validate(articleCreate), controller.create);
router.put('/:id', authenticateAdmin, validateObjectId(), validate(articleUpdate), controller.update);
router.delete('/:id', authenticateAdmin, validateObjectId(), controller.delete);

router.get('/:id', validateObjectId(), controller.getById);

module.exports = router;
