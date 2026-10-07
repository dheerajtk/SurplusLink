const MealLog = require('../models/MealLog');

// GET /api/meal-logs?cafeteriaId=&from=&to=&menuItem=
exports.getLogs = async (req, res, next) => {
  try {
    const { cafeteriaId, from, to, menuItem } = req.query;
    const filter = {};

    // Staff can only view their own cafeteria unless admin
    if (req.user.role !== 'admin') {
      filter.cafeteriaId = req.user.cafeteriaId;
    } else if (cafeteriaId) {
      filter.cafeteriaId = cafeteriaId;
    }

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to);
    }
    if (menuItem) filter.menuItem = new RegExp(menuItem, 'i');

    const logs = await MealLog.find(filter)
      .sort({ date: -1 })
      .limit(100)
      .lean();

    res.json({ logs });
  } catch (err) {
    next(err);
  }
};

// POST /api/meal-logs
exports.createLog = async (req, res, next) => {
  try {
    const { date, menuItem, expectedAttendance, preparedQty, soldQty, forecastedQty, unit } = req.body;

    const cafeteriaId = req.user.cafeteriaId;
    if (!cafeteriaId) return res.status(400).json({ error: 'No cafeteria associated with your account' });

    const log = await MealLog.create({
      cafeteriaId,
      date: new Date(date),
      menuItem,
      expectedAttendance,
      preparedQty: preparedQty || 0,
      soldQty:     soldQty     || 0,
      forecastedQty,
      unit: unit || 'portions',
      loggedBy: req.user.userId,
    });

    res.status(201).json({ log });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/meal-logs/:id  (update sold qty at closing time)
exports.updateLog = async (req, res, next) => {
  try {
    const { soldQty, preparedQty } = req.body;
    const log = await MealLog.findById(req.params.id);

    if (!log) return res.status(404).json({ error: 'Log not found' });

    // Staff may only update logs from their cafeteria
    if (req.user.role === 'staff' && String(log.cafeteriaId) !== String(req.user.cafeteriaId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (soldQty    !== undefined) log.soldQty    = soldQty;
    if (preparedQty !== undefined) log.preparedQty = preparedQty;
    // leftoverQty and weekday are recalculated in the pre-save hook
    await log.save();

    res.json({ log });
  } catch (err) {
    next(err);
  }
};

// GET /api/meal-logs/:id
exports.getLog = async (req, res, next) => {
  try {
    const log = await MealLog.findById(req.params.id).lean();
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json({ log });
  } catch (err) {
    next(err);
  }
};
