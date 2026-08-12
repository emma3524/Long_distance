const router  = require('express').Router();
const User    = require('../models/User');
const CheckIn = require('../models/CheckIn');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// GET /api/admin/users  — list all non-admin users with streak info
router.get('/users', async (_req, res) => {
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
  res.json({ users });
});

// POST /api/admin/users  — create a new user account
router.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email and password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'user' });
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await CheckIn.deleteMany({ user: req.params.id });
  res.json({ message: 'User deleted' });
});

// GET /api/admin/users/:id/checkins  — full check-in history for a user
router.get('/users/:id/checkins', async (req, res) => {
  const entries = await CheckIn.find({ user: req.params.id }).sort({ date: -1 });
  res.json({ entries });
});

// PATCH /api/admin/users/:id/message  — send a custom note to a user
router.patch('/users/:id/message', async (req, res) => {
  const { message } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { adminMessage: message ?? '' },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

module.exports = router;
