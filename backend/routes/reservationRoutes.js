const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Order matters: specific paths before /:id
router.get('/tables', reservationController.getAllTables);
router.get('/availability', reservationController.checkAvailability);
router.post('/', reservationController.createReservation);
router.get('/', reservationController.getAllReservations);
router.get('/:id', reservationController.getReservationById);

module.exports = router;