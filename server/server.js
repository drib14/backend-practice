// Load Environment variables from local directory .env file
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database Cluster
connectDB();

// Apply General Core Middlewares
app.use(cors());
app.use(express.json());

// Morgan Dev Console Request Logger
app.use(morgan('dev'));

// Serve Static Assets from Client directory (if populated)
app.use(express.static(path.join(__dirname, '..', 'client')));

// Auth API Router endpoints
app.use('/api/auth', require('./routes/authRoutes'));

// E-Commerce API endpoints
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Root Endpoint - Premium Server Status Panel
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Prodify Auth Engine // Running</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Inter:wght@400;500&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #06060c;
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          overflow: hidden;
          position: relative;
        }
        .glow {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%);
          filter: blur(80px);
          top: 10%;
          left: 10%;
          z-index: -1;
        }
        .glow2 {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0) 70%);
          filter: blur(80px);
          bottom: 10%;
          right: 10%;
          z-index: -1;
        }
        .card {
          background-color: rgba(13, 13, 23, 0.65);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 2.5rem 3.5rem;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          max-width: 450px;
        }
        .icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
          margin: 0 auto 1.5rem;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
        }
        h1 {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.85rem;
          margin: 0 0 0.5rem;
          letter-spacing: 0.5px;
          background: linear-gradient(to right, #ffffff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          color: #06b6d4;
          font-size: 0.85rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }
        p {
          color: #94a3b8;
          font-size: 0.95rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .pulse {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
          animation: pulse-ring 2s infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      </style>
    </head>
    <body>
      <div class="glow"></div>
      <div class="glow2"></div>
      <div class="card">
        <div class="icon">🚀</div>
        <h1>PRODIFY AUTH ENGINE</h1>
        <div class="subtitle">MERN Stack Server</div>
        <p>Your premium e-commerce authentication and user management CRUD server is successfully connected to MongoDB and listening on active ports.</p>
        <div class="status">
          <span class="pulse"></span>
          <span>Server Status: Active</span>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Fallback routing for SPA static pages (if client populated)
app.get('*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Global Central Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(`[Global Error Handler] Stack: ${err.stack}`);

  // Mongoose Bad ObjectId Error (CastError)
  if (err.name === 'CastError') {
    return res.status(404).json({
      error: 'Resource not found',
      message: `Invalid ID format: '${err.value}'`
    });
  }

  // Mongoose Duplicate Key Error (e.g. Unique Index violations)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue).join(', ');
    return res.status(400).json({
      error: 'Duplicate field error',
      message: `The value entered for field(s) [${fields}] is already claimed. Please try another.`
    });
  }

  // Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      error: 'Validation failed',
      messages
    });
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Not authorized',
      message: 'Access denied. The authorization token is invalid.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Not authorized',
      message: 'Access denied. The authorization token has expired.'
    });
  }

  // Default Standardized server error response
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on our server.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Premium E-Commerce Auth Server listening on port ${PORT}`);
  console.log(`⚙️  Active Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================\n`);
});
