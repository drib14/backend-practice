const Order = require('../models/Order');

// @desc    Create a new e-commerce order
// @route   POST /api/orders
// @access  Private (JWT protected)
exports.createOrder = async (req, res) => {
  try {
    const { items, total, shippingFee, paymentDetails } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }

    if (!total || !paymentDetails || !paymentDetails.cardholderName || !paymentDetails.cardNumberMasked) {
      return res.status(400).json({ message: 'Please add all required checkout details' });
    }

    // Generate unique order number
    const orderNumber = '#KS-' + Math.floor(100000 + Math.random() * 900000).toString();

    const order = await Order.create({
      user: req.user.id,
      orderNumber,
      items,
      total,
      shippingFee: shippingFee || 5.00,
      paymentDetails,
    });

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully and logged in database!',
      order,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Server error placing your order' });
  }
};

// @desc    Get current user's order history
// @route   GET /api/orders
// @access  Private (JWT protected)
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({ message: 'Server error fetching order history' });
  }
};
