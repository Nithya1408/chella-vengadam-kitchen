const db = require('../config/db');

// GET /api/reservations/tables — List all tables with current status
exports.getAllTables = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT table_id, table_number, capacity, status 
       FROM restaurant_tables 
       ORDER BY capacity, table_number`
    );
    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tables',
      error: err.message,
    });
  }
};

// GET /api/reservations/availability?date=YYYY-MM-DD&time=HH:MM
// Returns tables already booked at that slot
exports.checkAvailability = async (req, res) => {
  try {
    const { date, time } = req.query;
    
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required',
      });
    }

    // Get tables booked within ±2 hours of the requested slot
    const [rows] = await db.query(
      `SELECT DISTINCT table_id 
       FROM reservations 
       WHERE reservation_date = ?
         AND ABS(TIMESTAMPDIFF(MINUTE, 
                  CONCAT(reservation_date, ' ', reservation_time), 
                  CONCAT(?, ' ', ?))) < 120
         AND status IN ('pending', 'confirmed')
         AND table_id IS NOT NULL`,
      [date, date, time]
    );
    const bookedTableIds = rows.map(r => r.table_id);
    res.json({
      success: true,
      booked_table_ids: bookedTableIds,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Availability check failed',
      error: err.message,
    });
  }
};

// POST /api/reservations — Create a new reservation
exports.createReservation = async (req, res) => {
  try {
    const {
      table_id,
      guest_name,
      guest_phone,
      party_size,
      reservation_date,
      reservation_time,
      notes,
    } = req.body;

    // Validation
    if (!guest_name || !guest_phone || !party_size || !reservation_date || !reservation_time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (!table_id) {
      return res.status(400).json({
        success: false,
        message: 'Please select a table',
      });
    }

    // Check capacity
    const [tableRows] = await db.query(
      `SELECT capacity, table_number FROM restaurant_tables WHERE table_id = ?`,
      [table_id]
    );

    if (tableRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    if (party_size > tableRows[0].capacity) {
      return res.status(400).json({
        success: false,
        message: `Table ${tableRows[0].table_number} fits only ${tableRows[0].capacity} guests`,
      });
    }

  
    // Check if table is already booked within ±2 hours
    const [conflictRows] = await db.query(
      `SELECT reservation_id FROM reservations 
       WHERE table_id = ? 
         AND reservation_date = ?
         AND ABS(TIMESTAMPDIFF(MINUTE, 
                  CONCAT(reservation_date, ' ', reservation_time), 
                  CONCAT(?, ' ', ?))) < 120
         AND status IN ('pending', 'confirmed')`,
      [table_id, reservation_date, reservation_date, reservation_time]
    );

    if (conflictRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This table is already booked within 2 hours of your time slot',
      });
    }

    // Insert reservation
    const [result] = await db.query(
      `INSERT INTO reservations 
        (table_id, guest_name, guest_phone, party_size, reservation_date, reservation_time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)`,
      [table_id, guest_name, guest_phone, party_size, reservation_date, reservation_time, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed',
      data: {
        reservation_id: result.insertId,
        reservation_number: `RV${String(result.insertId).padStart(5, '0')}`,
        table_number: tableRows[0].table_number,
        guest_name,
        party_size,
        reservation_date,
        reservation_time,
        status: 'confirmed',
      },
    });
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create reservation',
      error: err.message,
    });
  }
};

// GET /api/reservations/:id — Get a specific reservation
exports.getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT r.*, t.table_number, t.capacity 
       FROM reservations r 
       LEFT JOIN restaurant_tables t ON r.table_id = t.table_id 
       WHERE r.reservation_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    res.json({
      success: true,
      data: {
        ...rows[0],
        reservation_number: `RV${String(rows[0].reservation_id).padStart(5, '0')}`,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservation',
      error: err.message,
    });
  }
};

// GET /api/reservations — List recent reservations (for admin)
exports.getAllReservations = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, t.table_number, t.capacity 
       FROM reservations r 
       LEFT JOIN restaurant_tables t ON r.table_id = t.table_id 
       ORDER BY r.reservation_date DESC, r.reservation_time DESC 
       LIMIT 50`
    );
    res.json({
      success: true,
      count: rows.length,
      data: rows.map(r => ({
        ...r,
        reservation_number: `RV${String(r.reservation_id).padStart(5, '0')}`,
      })),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations',
      error: err.message,
    });
  }
};