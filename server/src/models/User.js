const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },

  // streak tracking
  streak:       { type: Number, default: 0 },
  lastCheckIn:  { type: Date, default: null },

  // message from admin shown at start of check-in
  adminMessage: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Never send password in JSON responses
userSchema.set('toJSON', {
  transform: (_doc, obj) => { delete obj.password; return obj; },
});

module.exports = mongoose.model('User', userSchema);
