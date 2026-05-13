const db = require('../config/db');

// POST /api/orders — Create a new order
exports.createOrder = async (req, res) => {
  // Get a connection from the pool for transaction
  const connection = await db.getConnection();
  
  try {
    const {
      customer_name,
      customer_phone,
      order_type,        // 'dine-in' | 'takeaway' | 'delivery'
      table_id,          // optional, for dine-in
      payment_method,    // 'cash' | 'card' | 'upi'
      notes,
      items              // [{ item_id, quantity, price, name }]
    } = req.body;

    // Basic validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    if (!customer_name || !customer_phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone are required'
      });
    }

    // Calculate total on the backend (never trust frontend prices!)
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.price) * item.quantity;
    }
    const gst = subtotal * 0.05;
    const totalAmount = subtotal + gst;

    // Start transaction
    await connection.beginTransaction();

    // 1. Insert into orders table
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
        (table_id, order_type, status, total_amount, payment_method, payment_status, notes)
       VALUES (?, ?, 'pending', ?, ?, 'unpaid', ?)`,
      [
        table_id || null,
        order_type || 'dine-in',
        totalAmount,
        payment_method || 'cash',
        notes || `Customer: ${customer_name} | Phone: ${customer_phone}`
      ]
    );

    const orderId = orderResult.insertId;

    // 2. Insert each order item
    const itemValues = items.map(item => [
      orderId,
      item.item_id,
      item.quantity,
      Number(item.price)
    ]);

    await connection.query(
      `INSERT INTO order_items (order_id, item_id, quantity, price_at_order) VALUES ?`,
      [itemValues]
    );

    // 3. If dine-in with a table, mark table as occupied
    if (order_type === 'dine-in' && table_id) {
      await connection.query(
        `UPDATE restaurant_tables SET status = 'occupied' WHERE table_id = ?`,
        [table_id]
      );
    }

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order_id: orderId,
        order_number: `CV${String(orderId).padStart(5, '0')}`,
        subtotal,
        gst,
        total_amount: totalAmount,
        order_type,
        status: 'pending'
      }
    });

  } catch (err) {
    await connection.rollback();
    console.error('Order creation error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: err.message
    });
  } finally {
    connection.release();
  }
};

// GET /api/orders/:id — Get a specific order with items
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orderRows] = await db.query(
      `SELECT * FROM orders WHERE order_id = ?`,
      [id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const [itemRows] = await db.query(
      `SELECT 
        oi.order_item_id, oi.quantity, oi.price_at_order,
        m.name, m.is_veg
       FROM order_items oi
       LEFT JOIN menu_items m ON oi.item_id = m.item_id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...orderRows[0],
        order_number: `CV${String(orderRows[0].order_id).padStart(5, '0')}`,
        items: itemRows
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: err.message
    });
  }
};

// GET /api/orders — Get all orders (for admin later)
exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT order_id, table_id, order_type, status, total_amount,
              payment_status, payment_method, notes, created_at
       FROM orders ORDER BY created_at DESC LIMIT 50`
    );
    res.json({
      success: true,
      count: rows.length,
      data: rows.map(o => ({
        ...o,
        order_number: `CV${String(o.order_id).padStart(5, '0')}`
      }))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: err.message
    });
  }
};