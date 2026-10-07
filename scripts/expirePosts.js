/**
 * Expiry cron — marks surplus posts as "expired" when expiryTime has passed.
 *
 * Run this on a schedule. On Render free tier, use a Render Cron Job:
 *   Command: node scripts/expirePosts.js
 *   Schedule: every 30 minutes  (*/30 * * * *)
 *
 * WHY: MongoDB TTL deletes the entire document after 30 days (for DB cleanup).
 * But we want to mark status="expired" immediately so the UI shows it.
 * This script does that soft-expire step.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
const mongoose = require('mongoose');
const SurplusPost = require('../server/models/SurplusPost');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const result = await SurplusPost.updateMany(
    { status: 'available', expiryTime: { $lt: new Date() } },
    { $set: { status: 'expired' } }
  );

  console.log(`[expiry-cron] Expired ${result.modifiedCount} posts`);
  await mongoose.disconnect();
})();
