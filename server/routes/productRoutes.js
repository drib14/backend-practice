const express = require('express');
const router = express.Router();
const { getProducts } = require('../controllers/productController');

// Public route
router.get('/', getProducts);

module.exports = router;
