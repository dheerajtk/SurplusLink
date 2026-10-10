require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const app = express();

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ── Health check (used by UptimeRobot to keep Render awake) ──────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/seed',       require('./routes/seed.routes'));   // TEMP — remove after seeding
app.use('/api/auth',       require('./routes/auth.routes'));
app.use('/api/meal-logs',  require('./routes/mealLog.routes'));
app.use('/api/surplus',    require('./routes/surplus.routes'));
app.use('/api/forecast',   require('./routes/forecast.routes'));
app.use('/api/admin',      require('./routes/admin.routes'));

// ── Global error handler ──────────────────────────────────────────────────────
app.use(require('./middleware/errorHandler'));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[server] running on port ${PORT}`));
