const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper: generate JWT
function generateToken(user) {
  return jwt.sign(
    { 
      user_id: user.user_id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if email already exists
    const [existing] = await db.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Hash the password (10 rounds is industry standard)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user (default role is 'customer')
    const [result] = await db.query(
      `INSERT INTO users (name, email, phone, password, role) 
       VALUES (?, ?, ?, ?, 'customer')`,
      [name, email, phone || null, hashedPassword]
    );

    const newUser = {
      user_id: result.insertId,
      name,
      email,
      phone: phone || null,
      role: 'customer',
    };

    // Generate token immediately so user is logged in after signup
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      success: false,
      message: 'Signup failed',
      error: err.message,
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Don't say "email not found" — that helps attackers. Vague message.
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = users[0];

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Don't send password back!
    const userResponse = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const token = generateToken(userResponse);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message,
    });
  }
};

// GET /api/auth/me — get current user from token
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const [users] = await db.query(
      'SELECT user_id, name, email, phone, role, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: users[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: err.message,
    });
  }
};