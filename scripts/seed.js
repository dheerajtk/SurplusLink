/**
 * Seed script — creates demo data for development.
 * Run once: node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
const mongoose = require('mongoose');
const User       = require('../server/models/User');
const Cafeteria  = require('../server/models/Cafeteria');
const Partner    = require('../server/models/Partner');
const MealLog    = require('../server/models/MealLog');

const MENU_ITEMS = ['Rajma Rice', 'Dal Makhani', 'Veg Pulao', 'Chole Bhature'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[seed] connected');

  // Clean slate
  await Promise.all([
    User.deleteMany({}), Cafeteria.deleteMany({}),
    Partner.deleteMany({}), MealLog.deleteMany({}),
  ]);

  // Cafeteria
  const caf = await Cafeteria.create({ name: 'Main Campus Cafeteria', address: 'Block A', timezone: 'Asia/Kolkata' });

  // Admin user (passwordHash field triggers bcrypt hook)
  const admin = await User.create({ name: 'Admin', email: 'admin@surpluslink.dev', passwordHash: 'Admin@1234', role: 'admin' });

  // Staff user
  const staff = await User.create({ name: 'Staff', email: 'staff@surpluslink.dev', passwordHash: 'Staff@1234', role: 'staff', cafeteriaId: caf._id });

  // Partner user + profile
  const partnerUser = await User.create({ name: 'Community Fridge', email: 'partner@surpluslink.dev', passwordHash: 'Partner@1234', role: 'partner' });
  await Partner.create({ userId: partnerUser._id, orgName: 'City Community Fridge', type: 'community_fridge', phone: '9999999999', approved: true });

  // 60 days of meal logs
  for (let d = 60; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    date.setHours(0, 0, 0, 0);

    for (const item of MENU_ITEMS) {
      const attendance = randomInt(150, 250);
      const prepared   = randomInt(attendance - 10, attendance + 20);
      const sold       = randomInt(Math.floor(prepared * 0.75), prepared);
      await MealLog.create({
        cafeteriaId: caf._id, date, menuItem: item,
        expectedAttendance: attendance, preparedQty: prepared, soldQty: sold,
        forecastedQty: randomInt(attendance - 20, attendance + 10),
        unit: 'portions', loggedBy: staff._id,
      });
    }
  }

  console.log('[seed] Done! Credentials:');
  console.log('  admin@surpluslink.dev  / Admin@1234');
  console.log('  staff@surpluslink.dev  / Staff@1234');
  console.log('  partner@surpluslink.dev / Partner@1234');
  await mongoose.disconnect();
})();
