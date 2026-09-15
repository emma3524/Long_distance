const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text:      { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Question', questionSchema);
