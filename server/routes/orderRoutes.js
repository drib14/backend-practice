const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes (JWT required)
router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);

module.exports = router;
