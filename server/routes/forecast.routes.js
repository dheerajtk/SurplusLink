const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const { getForecast } = require('../controllers/forecast.controller');

// Only logged-in staff/admin can request a forecast
router.get('/', protect, requireRole('staff', 'admin'), getForecast);

module.exports = router;
