const { Router } = require('express');
const controller = require('../controllers/reservations.controller');

const router = Router();

router.get('/stats', controller.stats);
router.get('/export', controller.exportReservations);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
