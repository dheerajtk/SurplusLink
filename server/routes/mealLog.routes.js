const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/mealLog.controller');

router.use(protect);  // all meal-log routes require login

router.get('/',     requireRole('staff', 'admin'), ctrl.getLogs);
router.post('/',    requireRole('staff'),           ctrl.createLog);
router.get('/:id',  requireRole('staff', 'admin'), ctrl.getLog);
router.patch('/:id', requireRole('staff', 'admin'), ctrl.updateLog);

module.exports = router;
