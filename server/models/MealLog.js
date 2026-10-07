const mongoose = require('mongoose');

const mealLogSchema = new mongoose.Schema(
  {
    cafeteriaId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Cafeteria', required: true },
    date:               { type: Date, required: true },       // midnight UTC of the log day
    weekday:            { type: Number, min: 0, max: 6 },     // 0=Sun, 1=Mon … 6=Sat (denormalised)
    menuItem:           { type: String, required: true, trim: true },
    expectedAttendance: { type: Number, required: true, min: 0 },
    preparedQty:        { type: Number, default: 0, min: 0 },
    soldQty:            { type: Number, default: 0, min: 0 },
    leftoverQty:        { type: Number, default: 0, min: 0 }, // stored for fast analytics
    forecastedQty:      { type: Number, default: null },       // what the algorithm predicted
    unit:               { type: String, enum: ['portions', 'kg', 'litres'], default: 'portions' },
    loggedBy:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Auto-set weekday and leftoverQty before saving
mealLogSchema.pre('save', function (next) {
  this.weekday     = new Date(this.date).getDay();
  this.leftoverQty = Math.max(0, this.preparedQty - this.soldQty);
  next();
});

// Compound indexes for forecast queries and date-range lookups
mealLogSchema.index({ cafeteriaId: 1, date: -1 });
mealLogSchema.index({ cafeteriaId: 1, menuItem: 1, weekday: 1, date: -1 });

module.exports = mongoose.model('MealLog', mealLogSchema);
