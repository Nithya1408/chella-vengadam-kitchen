const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ============ CORS ============
// Allows local dev (localhost:5173) AND deployed frontend (FRONTEND_URL env var on Render)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5050',
  process.env.FRONTEND_URL, // Will be set in Render's env vars after Netlify deploy
].filter(Boolean); // Removes undefined entries

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ============ Middleware ============
app.use(express.json());

// ============ Routes ============
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Chella Vengadam\'s Kitchen API',
    status: 'running',
    version: '1.0.0',
  });
});

// Test database route
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW() AS server_time');
    res.json({
      success: true,
      message: 'Database connected',
      server_time: rows[0].server_time,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: err.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});