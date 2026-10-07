const mongoose = require('mongoose');

const cafeteriaSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    address:  { type: String, default: '' },
    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cafeteria', cafeteriaSchema);
