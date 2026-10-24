require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');

const authRoutes   = require('./routes/auth');
const checkinRoutes = require('./routes/checkin');
const adminRoutes  = require('./routes/admin');

const app = express();

// Allow the production Vercel URL, any Vercel preview deployment, and localhost dev
const ALLOWED_ORIGINS = [
  'https://long-distance-rouge.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any *.vercel.app subdomain (covers all preview deployments)
    if (origin.endsWith('.vercel.app') || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth',    authRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/admin',   adminRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Keep Render free tier alive by pinging self every 14 minutes
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_URL) {
  setInterval(() => {
    fetch(`${RENDER_URL}/api/health`)
      .then(() => console.log('Self-ping ok'))
      .catch(err => console.error('Self-ping failed:', err.message));
  }, 14 * 60 * 1000); // 14 minutes
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error(err); process.exit(1); });
