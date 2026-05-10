const router = require('express').Router();

const ProjectModel = require('../models/Project.model');
const ContentRepository = require('../repositories/content.repository');
const ContentService = require('../services/content.service');
const ContentController = require('../controllers/content.controller');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const validateObjectId = require('../middleware/validateObjectId');
const { projectCreate, projectUpdate, contentQuery, validate } = require('../validators/content.validator');

const repo = new ContentRepository(ProjectModel);
const service = new ContentService(repo, { hasSlug: false });
const controller = new ContentController(service);

router.get('/', validate(contentQuery, 'query'), controller.getAll);

router.get('/admin/all', authenticateAdmin, validate(contentQuery, 'query'), controller.getAllAdmin);
router.post('/', authenticateAdmin, validate(projectCreate), controller.create);
router.put('/:id', authenticateAdmin, validateObjectId(), validate(projectUpdate), controller.update);
router.delete('/:id', authenticateAdmin, validateObjectId(), controller.delete);

router.get('/:id', validateObjectId(), controller.getById);

module.exports = router;
