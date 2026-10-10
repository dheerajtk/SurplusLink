/**
 * Temporary one-time seed route.
 * Call POST /api/seed?key=surpluslink_seed_2024 to populate demo data.
 * DELETE this file after seeding!
 */
const router = require('express').Router();
const mongoose = require('mongoose');
const User      = require('../models/User');
const Cafeteria = require('../models/Cafeteria');
const Partner   = require('../models/Partner');
const MealLog   = require('../models/MealLog');

const MENU_ITEMS = ['Rajma Rice', 'Dal Makhani', 'Veg Pulao', 'Chole Bhature'];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

router.post('/', async (req, res) => {
  // Simple secret key guard so random users can't trigger this
  if (req.query.key !== 'surpluslink_seed_2024') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // Clean slate
    await Promise.all([
      User.deleteMany({}),
      Cafeteria.deleteMany({}),
      Partner.deleteMany({}),
      MealLog.deleteMany({}),
    ]);

    // Cafeteria
    const caf = await Cafeteria.create({
      name: 'Main Campus Cafeteria',
      address: 'Block A',
      timezone: 'Asia/Kolkata',
    });

    // Admin
    await User.create({
      name: 'Admin',
      email: 'admin@surpluslink.dev',
      passwordHash: 'Admin@1234',
      role: 'admin',
    });

    // Staff
    const staff = await User.create({
      name: 'Staff',
      email: 'staff@surpluslink.dev',
      passwordHash: 'Staff@1234',
      role: 'staff',
      cafeteriaId: caf._id,
    });

    // Partner
    const partnerUser = await User.create({
      name: 'Community Fridge',
      email: 'partner@surpluslink.dev',
      passwordHash: 'Partner@1234',
      role: 'partner',
    });
    await Partner.create({
      userId: partnerUser._id,
      orgName: 'City Community Fridge',
      type: 'community_fridge',
      phone: '9999999999',
      approved: true,
    });

    // 30 days of meal logs
    for (let d = 30; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      date.setHours(0, 0, 0, 0);
      for (const item of MENU_ITEMS) {
        const attendance = rand(150, 250);
        const prepared   = rand(attendance - 10, attendance + 20);
        const sold       = rand(Math.floor(prepared * 0.75), prepared);
        await MealLog.create({
          cafeteriaId: caf._id,
          date,
          menuItem: item,
          expectedAttendance: attendance,
          preparedQty: prepared,
          soldQty: sold,
          forecastedQty: rand(attendance - 20, attendance + 10),
          unit: 'portions',
          loggedBy: staff._id,
        });
      }
    }

    res.json({
      success: true,
      message: 'Seeded successfully! DELETE /server/routes/seed.routes.js now.',
      credentials: {
        admin:   'admin@surpluslink.dev / Admin@1234',
        staff:   'staff@surpluslink.dev / Staff@1234',
        partner: 'partner@surpluslink.dev / Partner@1234',
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
