const router  = require('express').Router();
const CheckIn = require('../models/CheckIn');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/checkin/today  — has the user already checked in today?
router.get('/today', protect, async (req, res) => {
  const today = todayStr();
  const entry = await CheckIn.findOne({ user: req.user._id, date: today });
  res.json({ checkedIn: !!entry, entry });
});

// POST /api/checkin  — submit today's check-in
router.post('/', protect, async (req, res) => {
  try {
    const today = todayStr();

    const existing = await CheckIn.findOne({ user: req.user._id, date: today });
    if (existing) return res.status(409).json({ message: 'Already checked in today' });

    const { answers } = req.body;
    const entry = await CheckIn.create({ user: req.user._id, date: today, answers });

    // Update streak
    const user      = req.user;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = dateStr(yesterday);

    if (user.lastCheckIn && dateStr(new Date(user.lastCheckIn)) === yStr) {
      user.streak += 1;
    } else if (!user.lastCheckIn || dateStr(new Date(user.lastCheckIn)) !== today) {
      user.streak = 1;
    }
    user.lastCheckIn = new Date();
    await user.save();

    res.status(201).json({ entry, streak: user.streak });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/checkin/history  — user's own past check-ins
router.get('/history', protect, async (req, res) => {
  const entries = await CheckIn.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
  res.json({ entries });
});

function todayStr() { return dateStr(new Date()); }
function dateStr(d) {
  return d.toISOString().slice(0, 10);
}

module.exports = router;
