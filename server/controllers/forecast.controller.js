const MealLog = require('../models/MealLog');
const { forecast } = require('../services/forecast.service');

// GET /api/forecast?menuItem=Rajma+Rice&attendance=200&date=2024-06-12
exports.getForecast = async (req, res, next) => {
  try {
    const { menuItem, attendance, date } = req.query;

    if (!menuItem || !attendance) {
      return res.status(400).json({ error: 'menuItem and attendance are required' });
    }

    const todayDate    = date ? new Date(date) : new Date();
    const todayWeekday = todayDate.getDay();
    const cafeteriaId  = req.user.cafeteriaId;

    // Fetch the last 30 logs for this item across all weekdays
    const history = await MealLog.find({ cafeteriaId, menuItem })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    // Reverse so history is oldest-first (EWMA processes in order)
    history.reverse();

    const portions = forecast({
      history,
      todayAttendance: Number(attendance),
      todayWeekday,
    });

    res.json({
      menuItem,
      todayWeekday,
      todayAttendance: Number(attendance),
      historicalPoints: history.length,
      recommendedPortions: portions,
    });
  } catch (err) {
    next(err);
  }
};
