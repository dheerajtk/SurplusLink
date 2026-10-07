const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit:     { type: String, default: 'portions' },
  },
  { _id: false }
);

const surplusPostSchema = new mongoose.Schema(
  {
    cafeteriaId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Cafeteria', required: true },
    mealLogId:    { type: mongoose.Schema.Types.ObjectId, ref: 'MealLog', default: null },
    items:        { type: [itemSchema], required: true },
    preparedTime: { type: Date, required: true },
    expiryTime:   { type: Date, required: true },
    status: {
      type: String,
      enum: ['available', 'claimed', 'picked_up', 'expired'],
      default: 'available',
    },
    postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    claimedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    claimedAt:   { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Board query: active posts sorted by expiry
surplusPostSchema.index({ status: 1, expiryTime: 1 });
surplusPostSchema.index({ cafeteriaId: 1, createdAt: -1 });

// TTL: permanently remove documents 30 days after expiryTime
// (keeps DB clean without losing short-term analytics)
surplusPostSchema.index({ expiryTime: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('SurplusPost', surplusPostSchema);
