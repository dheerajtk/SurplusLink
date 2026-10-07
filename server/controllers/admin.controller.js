const User = require('../models/User');
const Partner = require('../models/Partner');
const MealLog = require('../models/MealLog');
const SurplusPost = require('../models/SurplusPost');
const { forecastAccuracy } = require('../services/forecast.service');

// GET /api/admin/partners  — list all partners (pending first)
exports.getPartners = async (req, res, next) => {
  try {
    const partners = await Partner.find()
      .sort({ approved: 1, createdAt: -1 })
      .populate('userId', 'name email')
      .lean();
    res.json({ partners });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/partners/:id/approve
exports.approvePartner = async (req, res, next) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    ).populate('userId', 'name email');

    if (!partner) return res.status(404).json({ error: 'Partner not found' });
    res.json({ partner });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/metrics
exports.getMetrics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // ── Meal logs from last 30 days ────────────────────────────────────────────
    const logs = await MealLog.find({ date: { $gte: thirtyDaysAgo } }).lean();

    const totalPrepared  = logs.reduce((s, l) => s + (l.preparedQty  || 0), 0);
    const totalSold      = logs.reduce((s, l) => s + (l.soldQty      || 0), 0);
    const totalLeftover  = logs.reduce((s, l) => s + (l.leftoverQty  || 0), 0);
    const wastePercent   = totalPrepared > 0
      ? Math.round((totalLeftover / totalPrepared) * 100)
      : 0;

    // ── Surplus posts ──────────────────────────────────────────────────────────
    const [totalPosts, pickedUp] = await Promise.all([
      SurplusPost.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      SurplusPost.countDocuments({ status: 'picked_up', createdAt: { $gte: thirtyDaysAgo } }),
    ]);
    const pickupRate = totalPosts > 0 ? Math.round((pickedUp / totalPosts) * 100) : 0;

    // ── Forecast accuracy ──────────────────────────────────────────────────────
    const maePct = forecastAccuracy(logs);

    // ── User counts ────────────────────────────────────────────────────────────
    const [staffCount, partnerCount] = await Promise.all([
      User.countDocuments({ role: 'staff' }),
      User.countDocuments({ role: 'partner' }),
    ]);

    res.json({
      period: '30 days',
      meals: { totalPrepared, totalSold, totalLeftover, wastePercent },
      surplus: { totalPosts, pickedUp, pickupRate },
      forecast: { maePercent: maePct },
      users: { staffCount, partnerCount },
    });
  } catch (err) {
    next(err);
  }
};
