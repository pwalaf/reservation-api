const { Router } = require('express');
const controller = require('../controllers/reservations.controller');
const { stats } = require('../controllers/reservations.stats');

const router = Router();

router.get('/stats', stats);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
