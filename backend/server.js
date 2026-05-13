const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());           // Allow frontend (port 5173) to talk to backend
app.use(express.json());    // Parse incoming JSON from frontend
// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
// Health check route
app.get('/', (req, res) => {
  res.json({
    message: ' Welcome to Chella Vengadam\'s Kitchen API',
    status: 'running',
    version: '1.0.0'
  });
});

// Test database route
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW() AS server_time');
    res.json({
      success: true,
      message: 'Database connected',
      server_time: rows[0].server_time
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: err.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});