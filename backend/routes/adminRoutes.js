const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

// All admin routes require: valid JWT + admin role
router.use(protect);
router.use(requireRole('admin'));

// Stats / overview
router.get('/stats', adminController.getStats);

// Orders
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Reservations
router.get('/reservations', adminController.getReservations);
router.patch('/reservations/:id/status', adminController.updateReservationStatus);

// Menu management
router.get('/menu', adminController.getMenuItems);
router.patch('/menu/:id/availability', adminController.toggleMenuAvailability);

// Inventory
router.get('/inventory', adminController.getInventory);
router.patch('/inventory/:id', adminController.updateInventory);
module.exports = router;