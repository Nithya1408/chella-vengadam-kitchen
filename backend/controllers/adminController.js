const db = require('../config/db');

// ============ GET /api/admin/stats ============
// Returns headline numbers for the overview tab
exports.getStats = async (req, res) => {
  try {
    // Today's revenue + order count
    const [todayStats] = await db.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) AS today_revenue,
        COUNT(*) AS today_orders
      FROM orders
      WHERE DATE(created_at) = CURDATE()
        AND status != 'cancelled'
    `);

    // Pending orders right now
    const [pendingOrders] = await db.query(`
      SELECT COUNT(*) AS count FROM orders WHERE status IN ('pending', 'preparing')
    `);

    // Upcoming reservations (today or future, status confirmed/pending)
    const [upcomingReservations] = await db.query(`
      SELECT COUNT(*) AS count FROM reservations 
      WHERE reservation_date >= CURDATE() 
        AND status IN ('pending', 'confirmed')
    `);

    // Tables occupied
    const [tables] = await db.query(`
      SELECT 
        SUM(status = 'occupied') AS occupied,
        COUNT(*) AS total
      FROM restaurant_tables
    `);

    // Total customers
    const [customers] = await db.query(`
      SELECT COUNT(*) AS count FROM users WHERE role = 'customer'
    `);

    // Total dishes (available)
    const [dishes] = await db.query(`
      SELECT COUNT(*) AS count FROM menu_items WHERE is_available = TRUE
    `);

    // Last 7 days revenue chart
    const [weekRevenue] = await db.query(`
      SELECT 
        DATE(created_at) AS date,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(*) AS orders
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Top 5 best-selling items
    const [topItems] = await db.query(`
      SELECT 
        m.name,
        m.price,
        SUM(oi.quantity) AS sold,
        SUM(oi.quantity * oi.price_at_order) AS revenue
      FROM order_items oi
      JOIN menu_items m ON m.item_id = oi.item_id
      JOIN orders o ON o.order_id = oi.order_id
      WHERE o.status != 'cancelled'
      GROUP BY m.item_id, m.name, m.price
      ORDER BY sold DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        today_revenue: Number(todayStats[0].today_revenue),
        today_orders: todayStats[0].today_orders,
        pending_orders: pendingOrders[0].count,
        upcoming_reservations: upcomingReservations[0].count,
        tables_occupied: Number(tables[0].occupied) || 0,
        tables_total: tables[0].total,
        total_customers: customers[0].count,
        total_dishes: dishes[0].count,
        week_revenue: weekRevenue,
        top_items: topItems.map(i => ({
          name: i.name,
          sold: Number(i.sold),
          revenue: Number(i.revenue),
        })),
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: err.message });
  }
};

// ============ GET /api/admin/orders ============
// All orders with optional status filter
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT o.*, 
             t.table_number,
             COUNT(oi.order_item_id) AS item_count
      FROM orders o
      LEFT JOIN restaurant_tables t ON t.table_id = o.table_id
      LEFT JOIN order_items oi ON oi.order_id = o.order_id
    `;
    const params = [];
    if (status && status !== 'all') {
      sql += ` WHERE o.status = ?`;
      params.push(status);
    }
    sql += ` GROUP BY o.order_id ORDER BY o.created_at DESC LIMIT 100`;

    const [rows] = await db.query(sql, params);

    res.json({
      success: true,
      count: rows.length,
      data: rows.map(o => ({
        ...o,
        order_number: `CV${String(o.order_id).padStart(5, '0')}`,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
};

// ============ PATCH /api/admin/orders/:id/status ============
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [result] = await db.query(
      `UPDATE orders SET status = ? WHERE order_id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If order is completed/cancelled, free up the table
    if (status === 'completed' || status === 'cancelled') {
      await db.query(
        `UPDATE restaurant_tables 
         SET status = 'available' 
         WHERE table_id = (SELECT table_id FROM orders WHERE order_id = ?)
           AND table_id IS NOT NULL`,
        [id]
      );
    }

    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order', error: err.message });
  }
};

// ============ GET /api/admin/reservations ============
exports.getReservations = async (req, res) => {
  try {
    const { status, filter } = req.query;
    let sql = `
      SELECT r.*, t.table_number, t.capacity
      FROM reservations r
      LEFT JOIN restaurant_tables t ON t.table_id = r.table_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ` AND r.status = ?`;
      params.push(status);
    }

    if (filter === 'upcoming') {
      sql += ` AND r.reservation_date >= CURDATE()`;
    } else if (filter === 'past') {
      sql += ` AND r.reservation_date < CURDATE()`;
    }

    sql += ` ORDER BY r.reservation_date DESC, r.reservation_time DESC LIMIT 100`;

    const [rows] = await db.query(sql, params);
    res.json({
      success: true,
      count: rows.length,
      data: rows.map(r => ({
        ...r,
        reservation_number: `RV${String(r.reservation_id).padStart(5, '0')}`,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch reservations', error: err.message });
  }
};

// ============ PATCH /api/admin/reservations/:id/status ============
exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [result] = await db.query(
      `UPDATE reservations SET status = ? WHERE reservation_id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    res.json({ success: true, message: 'Reservation updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update reservation', error: err.message });
  }
};

// ============ GET /api/admin/menu ============
exports.getMenuItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, c.name AS category_name
      FROM menu_items m
      LEFT JOIN categories c ON c.category_id = m.category_id
      ORDER BY c.display_order, m.name
    `);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch menu', error: err.message });
  }
};

// ============ PATCH /api/admin/menu/:id/availability ============
exports.toggleMenuAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    const [result] = await db.query(
      `UPDATE menu_items SET is_available = ? WHERE item_id = ?`,
      [is_available ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, message: 'Menu item updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update menu item', error: err.message });
  }
};
// ============ PATCH /api/admin/inventory/:id ============
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reorder_level } = req.body;

    // Validation
    if (quantity === undefined && reorder_level === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Provide quantity and/or reorder_level',
      });
    }

    if (quantity !== undefined && (isNaN(quantity) || Number(quantity) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number',
      });
    }

    if (reorder_level !== undefined && (isNaN(reorder_level) || Number(reorder_level) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Reorder level must be a non-negative number',
      });
    }

    // Build dynamic update
    const updates = [];
    const params = [];

    if (quantity !== undefined) {
      updates.push('quantity = ?');
      params.push(Number(quantity));
      updates.push('last_restocked = CURDATE()');
    }
    if (reorder_level !== undefined) {
      updates.push('reorder_level = ?');
      params.push(Number(reorder_level));
    }

    params.push(id);

    const [result] = await db.query(
      `UPDATE inventory SET ${updates.join(', ')} WHERE inventory_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }

    // Return the updated row
    const [rows] = await db.query(
      `SELECT *, CASE WHEN quantity <= reorder_level THEN 1 ELSE 0 END AS low_stock 
       FROM inventory WHERE inventory_id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Inventory updated',
      data: rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update inventory', error: err.message });
  }
};

// ============ GET /api/admin/inventory ============
exports.getInventory = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *, 
        CASE WHEN quantity <= reorder_level THEN 1 ELSE 0 END AS low_stock
      FROM inventory
      ORDER BY low_stock DESC, ingredient_name
    `);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch inventory', error: err.message });
  }
};