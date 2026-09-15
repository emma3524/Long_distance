const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  date: { type: String, required: true }, // "YYYY-MM-DD" — one per user per day

  answers: {
    mood:          { type: String },
    activity:      { type: String },
    missLevel:     { type: String }, // e.g. "4/5 🥺"
    smiledAt:      { type: String },
    ateWell:       { type: String },
    energyLevel:   { type: String },
    wants:         { type: String },
    facetime:      { type: String },
    // daily rotating question
    dailyQuestion: { type: String }, // the question text that was shown
    dailyAnswer:   { type: String }, // the user's free-text response
  },

  submittedAt: { type: Date, default: Date.now },
});

// Unique check-in per user per day
checkInSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
