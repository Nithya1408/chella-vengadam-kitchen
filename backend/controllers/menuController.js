const db = require('../config/db');

// GET all menu items with their categories
exports.getAllMenuItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.item_id,
        m.name,
        m.description,
        m.price,
        m.is_veg,
        m.is_available,
        m.prep_time_minutes,
        m.image_url,
        c.category_id,
        c.name AS category_name
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.category_id
      WHERE m.is_available = TRUE
      ORDER BY c.display_order, m.name
    `);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: err.message
    });
  }
};

// GET all categories
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM categories ORDER BY display_order'
    );
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: err.message
    });
  }
};

// GET menu items by category
exports.getMenuByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await db.query(`
      SELECT 
        m.item_id, m.name, m.description, m.price,
        m.is_veg, m.prep_time_minutes, m.image_url,
        c.name AS category_name
      FROM menu_items m
      JOIN categories c ON m.category_id = c.category_id
      WHERE m.category_id = ? AND m.is_available = TRUE
      ORDER BY m.name
    `, [categoryId]);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: err.message
    });
  }
};