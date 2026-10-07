const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    orgName:  { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['charity', 'shelter', 'community_fridge', 'student_club', 'other'],
      required: true,
    },
    phone:    { type: String, default: '' },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for admin queries: unapproved partners first
partnerSchema.index({ approved: 1, createdAt: -1 });

module.exports = mongoose.model('Partner', partnerSchema);
