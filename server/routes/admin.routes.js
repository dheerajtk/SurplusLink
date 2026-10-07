const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/admin.controller');

router.use(protect, requireRole('admin')); // entire admin section locked

router.get('/partners',              ctrl.getPartners);
router.patch('/partners/:id/approve', ctrl.approvePartner);
router.get('/metrics',               ctrl.getMetrics);

module.exports = router;
