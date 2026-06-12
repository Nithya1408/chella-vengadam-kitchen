const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, requireRole } = require('../middleware/auth');

// Public — customers can place orders without account (uses contact info in body)
router.post('/', orderController.createOrder);

// Kitchen view — staff OR admin
router.get('/kitchen', protect, requireRole('staff', 'admin'), orderController.getKitchenOrders);
router.patch('/:id/status', protect, requireRole('staff', 'admin'), orderController.updateStatusFromKitchen);

// Order details
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;