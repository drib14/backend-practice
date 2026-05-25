const Product = require('../models/Product');

const DEFAULT_PRODUCTS = [
  {
    name: 'Keyshien Retro Heart Glasses',
    category: 'Eyewear',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    name: 'Crystal Bow Choker',
    category: 'Necklaces',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    name: 'Pearl Star Stud Earrings',
    category: 'Earrings',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
  {
    name: 'Pink Velvet Travel Organizer',
    category: 'Storage',
    price: 59.00,
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  },
];

// @desc    Get all products (Auto-seeds if database is empty)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    let products = await Product.find({});
    
    // Auto-seed if empty
    if (products.length === 0) {
      console.log('Product catalog is empty. Auto-seeding default accessories products...');
      await Product.insertMany(DEFAULT_PRODUCTS);
      products = await Product.find({});
    }

    res.status(200).json({
      status: 'success',
      results: products.length,
      products,
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ message: 'Server error retrieving boutique products' });
  }
};
