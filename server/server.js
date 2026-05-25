const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

// Middleware: Parse JSON bodies
app.use(express.json());

// Middleware: Serve static files from the restructured 'client' directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// Middleware: Custom Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Helper Functions for Data Access
async function readProducts() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Return empty array if file does not exist
      return [];
    }
    throw error;
  }
}

async function writeProducts(products) {
  // Write formatted JSON for readability
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
}

// Input Validation Helpers
function validateProduct(product, isUpdate = false) {
  const errors = [];
  const { name, price, stock, category, description } = product;

  // For POST or if field is present in PUT
  if (!isUpdate || name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      errors.push("Name must be a string with at least 2 characters.");
    }
  }

  if (!isUpdate || price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.push("Price must be a positive number.");
    }
  }

  if (!isUpdate || stock !== undefined) {
    const numStock = Number(stock);
    if (!Number.isInteger(numStock) || numStock < 0) {
      errors.push("Stock must be a non-negative integer.");
    }
  }

  if (!isUpdate || category !== undefined) {
    if (typeof category !== 'string' || category.trim().length < 2) {
      errors.push("Category must be a string with at least 2 characters.");
    }
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.push("Description must be a string.");
    }
  }

  return errors;
}

// API Routes

// 1. GET /api/products - Retrieve all products (supports search, category filter, sorting)
app.get('/api/products', async (req, res, next) => {
  try {
    let products = await readProducts();
    const { search, category, sortBy } = req.query;

    // Apply Search Filter (Name or Description)
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply Category Filter
    if (category) {
      const catLower = category.toLowerCase();
      products = products.filter(p => p.category.toLowerCase() === catLower);
    }

    // Apply Sorting
    if (sortBy) {
      if (sortBy === 'price_asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'stock') {
        products.sort((a, b) => a.stock - b.stock);
      } else if (sortBy === 'newest') {
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } else {
      // Default: Sort by newest created
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(products);
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/products/:id - Retrieve single product
app.get('/api/products/:id', async (req, res, next) => {
  try {
    const products = await readProducts();
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found', message: `No product found with ID ${req.params.id}` });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/products - Create new product
app.post('/api/products', async (req, res, next) => {
  try {
    const errors = validateProduct(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', messages: errors });
    }

    const { name, description, price, stock, category } = req.body;
    const products = await readProducts();

    const newProduct = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      description: description ? description.trim() : '',
      price: parseFloat(Number(price).toFixed(2)),
      stock: parseInt(stock, 10),
      category: category.trim(),
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeProducts(products);

    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

// 4. PUT /api/products/:id - Update existing product
app.put('/api/products/:id', async (req, res, next) => {
  try {
    const products = await readProducts();
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found', message: `No product found with ID ${req.params.id}` });
    }

    const errors = validateProduct(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', messages: errors });
    }

    const currentProduct = products[index];
    const { name, description, price, stock, category } = req.body;

    const updatedProduct = {
      ...currentProduct,
      name: name !== undefined ? name.trim() : currentProduct.name,
      description: description !== undefined ? (description ? description.trim() : '') : currentProduct.description,
      price: price !== undefined ? parseFloat(Number(price).toFixed(2)) : currentProduct.price,
      stock: stock !== undefined ? parseInt(stock, 10) : currentProduct.stock,
      category: category !== undefined ? category.trim() : currentProduct.category,
      updatedAt: new Date().toISOString()
    };

    products[index] = updatedProduct;
    await writeProducts(products);

    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
});

// 5. DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', async (req, res, next) => {
  try {
    const products = await readProducts();
    const index = products.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found', message: `No product found with ID ${req.params.id}` });
    }

    const deletedProduct = products.splice(index, 1)[0];
    await writeProducts(products);

    res.json({ message: 'Product successfully deleted', id: req.params.id, product: deletedProduct });
  } catch (error) {
    next(error);
  }
});

// Fallback for SPA Routing: Send index.html from restructured client folder
app.get('*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[Error Handler] ${err.stack}`);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong on our server.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Restructured Inventory CRUD Backend running at http://localhost:${PORT}`);
  console.log(`📂 Database file stored at: ${DATA_FILE}`);
  console.log(`======================================================\n`);
});
