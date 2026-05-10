const router = require('express').Router();

const GalleryModel = require('../models/Gallery.model');
const ContentRepository = require('../repositories/content.repository');
const ContentService = require('../services/content.service');
const ContentController = require('../controllers/content.controller');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const validateObjectId = require('../middleware/validateObjectId');
const { galleryCreate, galleryUpdate, contentQuery, validate } = require('../validators/content.validator');

const repo = new ContentRepository(GalleryModel);
const service = new ContentService(repo, { hasSlug: false });
const controller = new ContentController(service);

// Public
router.get('/', validate(contentQuery, 'query'), controller.getAll);

// Admin
router.get('/admin/all', authenticateAdmin, validate(contentQuery, 'query'), controller.getAllAdmin);
router.post('/', authenticateAdmin, validate(galleryCreate), controller.create);
router.put('/:id', authenticateAdmin, validateObjectId(), validate(galleryUpdate), controller.update);
router.delete('/:id', authenticateAdmin, validateObjectId(), controller.delete);

router.get('/:id', validateObjectId(), controller.getById);

module.exports = router;
