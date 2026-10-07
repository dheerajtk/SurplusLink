const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/surplus.controller');

// Public: anyone can view the board
router.get('/', ctrl.getPosts);

// Authenticated routes
router.post('/',              protect, requireRole('staff'),           ctrl.createPost);
router.patch('/:id/claim',    protect, requireRole('partner'),         ctrl.claimPost);
router.patch('/:id/confirm',  protect, requireRole('partner'),         ctrl.confirmPickup);

module.exports = router;
