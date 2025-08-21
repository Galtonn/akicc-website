const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const path = require('path');
// const sharp = require('sharp'); // Removed - no longer resizing images
const fs = require('fs');
require('dotenv').config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : 'undefined');
console.log('PGHOST:', process.env.PGHOST);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGPORT:', process.env.PGPORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize database tables
(async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    userType TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    series TEXT NOT NULL,
    model TEXT NOT NULL,
    serialNumber TEXT UNIQUE,
    description TEXT,
    image TEXT,
    dealerPrice NUMERIC NOT NULL,
    endUserPrice NUMERIC NOT NULL,
    category TEXT NOT NULL,
    warranty TEXT,
    type TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add new columns to existing products table if they don't exist
  try {
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS series TEXT');
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty TEXT');
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT');
    
    // Update existing products to have series field (extract from name)
    await pool.query(`
      UPDATE products 
      SET series = CASE 
        WHEN name LIKE '%LaserJet%' THEN 'LaserJet'
        WHEN name LIKE '%OfficeJet%' THEN 'OfficeJet'
        WHEN name LIKE '%DeskJet%' THEN 'DeskJet'
        WHEN name LIKE '%Envy%' THEN 'Envy'
        WHEN name LIKE '%Pixma%' THEN 'Pixma'
        WHEN name LIKE '%WorkForce%' THEN 'WorkForce'
        WHEN name LIKE '%EcoTank%' THEN 'EcoTank'
        ELSE 'Standard'
      END
      WHERE series IS NULL OR series = ''
    `);
  } catch (error) {
    console.log('Columns already exist or update failed:', error.message);
  }

  // Create product_images table for multiple images
  await pool.query(`CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    productId INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    imagePath TEXT NOT NULL,
    displayOrder INTEGER DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create product_categories table for multiple categories per product
  await pool.query(`CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    productId INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create unregistered_customers table
  await pool.query(`CREATE TABLE IF NOT EXISTS unregistered_customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    companyName TEXT,
    userType TEXT NOT NULL,
    message TEXT NOT NULL,
    messageType TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS my_lists (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id),
    productId INTEGER NOT NULL REFERENCES products(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS sent_lists (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id),
    productIds TEXT NOT NULL,
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await pool.query(`CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    companyName TEXT,
    senderName TEXT NOT NULL,
    bookingDetails TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add userType and status columns if they don't exist (migration)
  try {
    await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS userType TEXT');
    console.log('userType column migration completed successfully');
  } catch (error) {
    console.error('userType column migration failed:', error.message);
  }

  try {
    await pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'Unregistered\'');
    console.log('status column migration completed successfully');
  } catch (error) {
    console.error('status column migration failed:', error.message);
  }

  // Add unique constraint to my_lists table to prevent duplicate entries
  try {
    await pool.query('ALTER TABLE my_lists ADD CONSTRAINT unique_user_product UNIQUE (userId, productId)');
    console.log('Unique constraint on my_lists table added successfully');
  } catch (error) {
    // Constraint might already exist, which is fine
    console.log('Unique constraint on my_lists table already exists or failed to add:', error.message);
  }

  // Create default admin user if not exists
  const adminPassword = bcrypt.hashSync('admin123', 10);
  await pool.query(
    `INSERT INTO users (username, email, password, userType)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (username) DO NOTHING`,
    ['admin', 'info.akicc@gmail.com', adminPassword, 'admin']
  );
})();

// File upload configuration
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Multiple file upload for product images
const uploadMultiple = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 images per product
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Function to save image without resizing
const saveImage = async (buffer, filename) => {
  try {
    // Save the original image without any processing
    const filepath = path.join('uploads', filename);
    fs.writeFileSync(filepath, buffer);
    
    return filename;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
};

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Add this mapping function near the top of the file
function mapProductFields(product) {
  if (!product) return product;
  return {
    ...product,
    dealerPrice: product.dealerprice,
    endUserPrice: product.enduserprice,
    serialNumber: product.serialnumber,
    createdAt: product.createdat,
    series: product.series,
    warranty: product.warranty,
    type: product.type,
  };
}

// Routes

// User registration
app.post('/api/register', async (req, res) => {
  const { username, email, password, userType } = req.body;

  if (!username || !email || !password || !userType) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['dealer', 'enduser'].includes(userType)) {
    return res.status(400).json({ error: 'Invalid user type' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (username, email, password, userType) VALUES ($1, $2, $3, $4) RETURNING id`,
      [username, email, hashedPassword, userType]
    );
    const userId = result.rows[0].id;
    
    const token = jwt.sign(
      {
        id: userId,
        username,
        userType // always camelCase
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: userId,
        username,
        email,
        userType: userType // always camelCase
      }
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = await pool.query(
    `SELECT * FROM users WHERE username = $1 OR email = $1`,
    [username]
  );

  if (user.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.rows[0].password);
  if (!validPassword) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    {
      id: user.rows[0].id,
      username: user.rows[0].username,
      userType: user.rows[0].usertype // map to camelCase
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.rows[0].id,
      username: user.rows[0].username,
      email: user.rows[0].email,
      userType: user.rows[0].usertype // map to camelCase
    }
  });
});

// Get products
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = 'SELECT DISTINCT p.* FROM products p';
    let params = [];
    let paramIndex = 1;

    if (category) {
      query += ' JOIN product_categories pc ON p.id = pc.productId WHERE pc.category = $1';
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += category ? ' AND' : ' WHERE';
      query += ` (LOWER(p.name) LIKE LOWER($${paramIndex}) OR LOWER(p.brand) LIKE LOWER($${paramIndex}) OR LOWER(p.series) LIKE LOWER($${paramIndex}) OR LOWER(p.model) LIKE LOWER($${paramIndex}) OR LOWER(p.type) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY p.createdAt DESC';

    const products = await pool.query(query, params);
    
    // Get additional images and categories for all products
    const productsWithImages = await Promise.all(
      products.rows.map(async (product) => {
        const additionalImages = await pool.query(
          'SELECT * FROM product_images WHERE productId = $1 ORDER BY displayOrder',
          [product.id]
        );
        
        const categories = await pool.query(
          'SELECT category FROM product_categories WHERE productId = $1',
          [product.id]
        );
        
        const productData = mapProductFields(product);
        productData.additionalImages = additionalImages.rows;
        productData.categories = categories.rows.map(c => c.category);
        
        return productData;
      })
    );

    res.json(productsWithImages);
  } catch (err) {
    console.error('Failed to fetch products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get additional images and categories for the product
    const additionalImages = await pool.query(
      'SELECT * FROM product_images WHERE productId = $1 ORDER BY displayOrder',
      [req.params.id]
    );

    const categories = await pool.query(
      'SELECT category FROM product_categories WHERE productId = $1',
      [req.params.id]
    );

    const productData = mapProductFields(product.rows[0]);
    productData.additionalImages = additionalImages.rows;
    productData.categories = categories.rows.map(c => c.category);

    res.json(productData);
  } catch (err) {
    console.error('Failed to fetch product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Add product (admin only)
app.post('/api/products', authenticateToken, uploadMultiple.array('images', 10), async (req, res) => {
  console.log('--- Add Product Request ---');
  console.log('User:', req.user);
  console.log('Body:', req.body);
  console.log('Files:', req.files);
  console.log('Files length:', req.files ? req.files.length : 0);

  // Fix: Check both userType and usertype for admin
  const isAdmin = req.user.userType === 'admin' || req.user.usertype === 'admin';
  if (!isAdmin) {
    console.log('Access denied: User is not admin');
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, brand, series, model, serialNumber, description, dealerPrice, endUserPrice, warranty, type } = req.body;
  // Handle categories array from FormData
  const categories = Array.isArray(req.body.categories) ? req.body.categories : 
                   (req.body.categories ? [req.body.categories] : []);
  let mainImage = null;
  let savedImages = [];

  // Process images if uploaded
  if (req.files && req.files.length > 0) {
    try {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filename = Date.now() + '-' + i + '-' + file.originalname;
        const savedFilename = await saveImage(file.buffer, filename);
        
        if (i === 0) {
          mainImage = savedFilename; // First image is the main image
        }
        savedImages.push(savedFilename);
      }
      console.log('Images saved:', savedImages);
    } catch (error) {
      console.error('Failed to process images:', error);
      return res.status(500).json({ error: 'Failed to process images' });
    }
  }

  // Validate required fields - only brand is required, series/name is optional
  if (!brand) {
    console.log('Validation failed: Brand is required');
    console.log('Fields:', { name, brand, series, model, dealerPrice, endUserPrice, categories });
    return res.status(400).json({ error: 'Brand is required' });
  }

  try {
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert the main product
      const result = await client.query(
        `INSERT INTO products (name, brand, series, model, serialNumber, description, image, dealerPrice, endUserPrice, warranty, type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [series || name, brand, series || null, model || null, serialNumber || null, description || null, mainImage, dealerPrice || null, endUserPrice || null, warranty || null, type || null]
      );
      const productId = result.rows[0].id;

      // Insert additional images
      for (let i = 1; i < savedImages.length; i++) {
        await client.query(
          `INSERT INTO product_images (productId, imagePath, displayOrder) VALUES ($1, $2, $3)`,
          [productId, savedImages[i], i]
        );
      }

      // Insert categories
      if (categories && categories.length > 0) {
        for (const category of categories) {
          if (category && category.trim()) {
            await client.query(
              `INSERT INTO product_categories (productId, category) VALUES ($1, $2)`,
              [productId, category]
            );
          }
        }
      }

      await client.query('COMMIT');

      const addedProduct = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
      console.log('Product added successfully:', addedProduct.rows[0]);
      res.json({ id: productId, message: 'Product added successfully', product: addedProduct.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Failed to add product:', err);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
});

// Update product (admin only)
app.put('/api/products/:id', authenticateToken, uploadMultiple.array('images', 10), async (req, res) => {
  console.log('--- Update Product Request ---');
  console.log('User:', req.user);
  console.log('Product ID:', req.params.id);
  console.log('Body:', req.body);
  console.log('Files:', req.files);

  if (req.user.userType !== 'admin') {
    console.log('Access denied: User is not admin');
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, brand, series, model, serialNumber, description, dealerPrice, endUserPrice, warranty, type, keepExistingImages } = req.body;
  // Handle categories array from FormData
  const categories = Array.isArray(req.body.categories) ? req.body.categories : 
                   (req.body.categories ? [req.body.categories] : []);
  let savedImages = [];

  // Process images if uploaded
  if (req.files && req.files.length > 0) {
    try {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filename = Date.now() + '-' + i + '-' + file.originalname;
        const savedFilename = await saveImage(file.buffer, filename);
        savedImages.push(savedFilename);
      }
      console.log('Images saved:', savedImages);
    } catch (error) {
      console.error('Failed to process images:', error);
      return res.status(500).json({ error: 'Failed to process images' });
    }
  }

  // Validate required fields - only brand is required, series/name is optional
  if (!brand) {
    console.log('Validation failed: Brand is required');
    console.log('Fields:', { name, brand, series, model, dealerPrice, endUserPrice, categories });
    return res.status(400).json({ error: 'Brand is required' });
  }

  try {
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current product to preserve existing image
      const currentProduct = await client.query('SELECT image FROM products WHERE id = $1', [req.params.id]);
      if (currentProduct.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Always keep the existing main image - don't replace it
      const finalMainImage = currentProduct.rows[0].image;

      // Update the main product (without changing the main image)
      const result = await client.query(
        `UPDATE products SET name = $1, brand = $2, series = $3, model = $4, serialNumber = $5, description = $6, 
         dealerPrice = $7, endUserPrice = $8, warranty = $9, type = $10 WHERE id = $11`,
        [series || name, brand, series || null, model || null, serialNumber || null, description || null, dealerPrice || null, endUserPrice || null, warranty || null, type || null, req.params.id]
      );

      if (result.rowCount === 0) {
        console.log('No rows updated - product not found');
        return res.status(404).json({ error: 'Product not found' });
      }

      // Handle images based on keepExistingImages option
      if (keepExistingImages === 'true') {
        // Keep existing images and add new ones
        const currentOrder = await client.query(
          'SELECT MAX(displayOrder) as maxOrder FROM product_images WHERE productId = $1',
          [req.params.id]
        );
        const startOrder = (currentOrder.rows[0].maxorder || 0) + 1;
        
        // Insert all new images as additional images
        for (let i = 0; i < savedImages.length; i++) {
          await client.query(
            `INSERT INTO product_images (productId, imagePath, displayOrder) VALUES ($1, $2, $3)`,
            [req.params.id, savedImages[i], startOrder + i]
          );
        }
      } else {
        // Replace all images (main image and additional images)
        if (savedImages.length > 0) {
          // Update the main image with the first uploaded image
          await client.query(
            'UPDATE products SET image = $1 WHERE id = $2',
            [savedImages[0], req.params.id]
          );
          
          // Delete all existing additional images
          await client.query('DELETE FROM product_images WHERE productId = $1', [req.params.id]);
          
          // Insert remaining images as additional images (skip the first one as it's now the main image)
          for (let i = 1; i < savedImages.length; i++) {
            await client.query(
              `INSERT INTO product_images (productId, imagePath, displayOrder) VALUES ($1, $2, $3)`,
              [req.params.id, savedImages[i], i]
            );
          }
        }
      }

      // Update categories
      await client.query('DELETE FROM product_categories WHERE productId = $1', [req.params.id]);
      if (categories && categories.length > 0) {
        for (const category of categories) {
          if (category && category.trim()) {
            await client.query(
              `INSERT INTO product_categories (productId, category) VALUES ($1, $2)`,
              [req.params.id, category]
            );
          }
        }
      }

      await client.query('COMMIT');
      res.json({ message: 'Product updated successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Failed to update product:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  console.log(`Attempting to delete product with id: ${req.params.id} by user:`, req.user);
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    // Manual cleanup: delete from my_lists first
    await pool.query('DELETE FROM my_lists WHERE productId = $1', [req.params.id]);
    // Delete additional images (product_images table has CASCADE, but let's be explicit)
    await pool.query('DELETE FROM product_images WHERE productId = $1', [req.params.id]);
    const result = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Failed to delete product:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

// Delete individual product image (admin only)
app.delete('/api/products/:productId/images/:imageId', authenticateToken, async (req, res) => {
  console.log(`Attempting to delete image ${req.params.imageId} from product ${req.params.productId} by user:`, req.user);
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const result = await pool.query(
      'DELETE FROM product_images WHERE id = $1 AND productId = $2',
      [req.params.imageId, req.params.productId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Failed to delete image:', err);
    res.status(500).json({ error: 'Failed to delete image', details: err.message });
  }
});

// Set main image (admin only)
app.put('/api/products/:productId/main-image', authenticateToken, async (req, res) => {
  console.log(`Attempting to set main image for product ${req.params.productId} by user:`, req.user);
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { imagePath } = req.body;
  if (!imagePath) {
    return res.status(400).json({ error: 'Image path is required' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE products SET image = $1 WHERE id = $2',
      [imagePath, req.params.productId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Main image updated successfully' });
  } catch (err) {
    console.error('Failed to update main image:', err);
    res.status(500).json({ error: 'Failed to update main image', details: err.message });
  }
});

// Add to my list
app.post('/api/mylist', authenticateToken, async (req, res) => {
  const { productId } = req.body;

  try {
    // Check if product is already in user's list
    const existingItem = await pool.query(
      'SELECT id FROM my_lists WHERE userId = $1 AND productId = $2',
      [req.user.id, productId]
    );

    if (existingItem.rows.length > 0) {
      return res.status(400).json({ error: 'Product is already in your list' });
    }

    // Add product to list if not already present
    const result = await pool.query(
      'INSERT INTO my_lists (userId, productId) VALUES ($1, $2) RETURNING id',
      [req.user.id, productId]
    );
    
    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Failed to add to list' });
    }
    
    res.json({ message: 'Added to list successfully' });
  } catch (error) {
    // Handle unique constraint violation if it exists
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return res.status(400).json({ error: 'Product is already in your list' });
    }
    console.error('Error adding to list:', error);
    res.status(500).json({ error: 'Failed to add to list' });
  }
});

// Get my list
app.get('/api/mylist', authenticateToken, async (req, res) => {
  try {
    const products = await pool.query(
      `SELECT p.*, ml.id as listId FROM products p 
            JOIN my_lists ml ON p.id = ml.productId 
            WHERE ml.userId = $1`,
      [req.user.id]
    );
    
    // Get additional images and categories for all products in the list
    const productsWithImages = await Promise.all(
      products.rows.map(async (product) => {
        const additionalImages = await pool.query(
          'SELECT * FROM product_images WHERE productId = $1 ORDER BY displayOrder',
          [product.id]
        );
        
        const categories = await pool.query(
          'SELECT category FROM product_categories WHERE productId = $1',
          [product.id]
        );
        
        const productData = mapProductFields(product);
        productData.additionalImages = additionalImages.rows;
        productData.categories = categories.rows.map(c => c.category);
        
        return productData;
      })
    );
    
    res.json(productsWithImages);
  } catch (err) {
    console.error('Failed to fetch my list:', err);
    res.status(500).json({ error: 'Failed to fetch my list' });
  }
});

// Remove from my list
app.delete('/api/mylist/:productId', authenticateToken, async (req, res) => {
  const result = await pool.query(
    'DELETE FROM my_lists WHERE userId = $1 AND productId = $2', 
    [req.user.id, req.params.productId]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Product not found in list' });
  }
  res.json({ message: 'Removed from list successfully' });
});

// Send list to admins
app.post('/api/mylist/send', authenticateToken, async (req, res) => {
  const products = await pool.query(
    `SELECT p.* FROM products p 
          JOIN my_lists ml ON p.id = ml.productId 
          WHERE ml.userId = $1`,
    [req.user.id]
  );

  if (products.rows.length === 0) {
    return res.status(400).json({ error: 'List is empty' });
  }

  const productIds = products.rows.map(p => p.id).join(',');
  
  const result = await pool.query(
    'INSERT INTO sent_lists (userId, productIds) VALUES ($1, $2) RETURNING id',
    [req.user.id, productIds]
  );
  if (result.rows.length === 0) {
    return res.status(500).json({ error: 'Failed to send list' });
  }

  // Send email to admin
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: 'info.akicc@gmail.com',
    subject: `Product List from ${req.user.username}`,
    html: `
          <h2>Product List Request</h2>
          <p><strong>User:</strong> ${req.user.username}</p>
          <p><strong>Products:</strong></p>
          <ul>
            ${products.rows.map(p => `<li>${p.name} - ${p.brand} ${p.model}</li>`).join('')}
          </ul>
        `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Email error:', error);
    }
  });

  res.json({ message: 'List sent successfully' });
});

// Get sent lists (admin only)
app.get('/api/sent-lists', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const lists = await pool.query(
    `SELECT sl.*, u.username, u.email FROM sent_lists sl 
          JOIN users u ON sl.userId = u.id 
          ORDER BY sl.sentAt DESC`
  );

  // For each sent list, fetch the product details
  const listsWithProducts = await Promise.all(
    lists.rows.map(async (list) => {
      const productIds = (list.productIds || list.productids || '').split(',').filter(Boolean);
      
      if (productIds.length === 0) {
        return { ...list, products: [] };
      }

      // Fetch product details for each product ID
      const products = await pool.query(
        `SELECT id, name, brand, series, model FROM products WHERE id = ANY($1)`,
        [productIds]
      );

      return {
        ...list,
        products: products.rows
      };
    })
  );

  res.json(listsWithProducts);
});

// Delete sent list (admin only)
app.delete('/api/sent-lists/:id', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const result = await pool.query('DELETE FROM sent_lists WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Sent list not found' });
  }
  res.json({ message: 'Sent list deleted successfully' });
});

// Send booking email
app.post('/api/contact/booking', async (req, res) => {
  const { email, phone, companyName, senderName, bookingDetails, userType } = req.body;

  console.log('Booking request received:', { email, phone, companyName, senderName, bookingDetails, userType });

  if (!email || !phone || !senderName || !bookingDetails) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  // Check if user is registered
  const user = await pool.query('SELECT id, userType, usertype, email FROM users WHERE email = $1', [email]);
  console.log('User lookup result:', user.rows);
  console.log('Looking for email:', email);
  
  // Also check all users to see what's in the database
  const allUsers = await pool.query('SELECT id, userType, usertype, email, username FROM users');
  console.log('All users in database:', allUsers.rows);
  
  // Check if there's a user with similar email
  const similarUsers = await pool.query('SELECT id, userType, usertype, email, username FROM users WHERE email ILIKE $1', [`%${email.split('@')[0]}%`]);
  console.log('Users with similar email:', similarUsers.rows);
  
  if (user.rows.length === 0) {
    // User is not registered, validate userType is provided
    if (!userType) {
      return res.status(400).json({ error: 'User type is required for unregistered users' });
    }
    
    // Save to unregistered_customers table for admin tracking
    await pool.query(
      `INSERT INTO unregistered_customers (name, email, phone, companyName, userType, message, messageType) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [senderName, email, phone, companyName, userType, bookingDetails, 'booking']
    );
  }

  // Save to bookings table (this is the main booking record)
  try {
    // Try with userType and status columns
    const result = await pool.query(
      `INSERT INTO bookings (email, phone, companyName, senderName, bookingDetails, userType, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        email, 
        phone, 
        companyName, 
        senderName, 
        bookingDetails, 
        user.rows.length > 0 ? (user.rows[0].userType || user.rows[0].usertype) : userType,
        user.rows.length > 0 ? 'Registered' : 'Unregistered'
      ]
    );
    if (result.rows.length === 0) {
      return res.status(500).json({ error: 'Failed to save booking' });
    }
    console.log('Booking saved successfully with userType and status:', result.rows[0]);
    console.log('Saved data:', {
      email,
      userType: user.rows.length > 0 ? (user.rows[0].userType || user.rows[0].usertype) : userType,
      status: user.rows.length > 0 ? 'Registered' : 'Unregistered',
      userFound: user.rows.length > 0
    });
  } catch (error) {
    console.error('Error saving booking with userType and status:', error);
    
    // Fallback: try with userType only
    try {
      const result = await pool.query(
        `INSERT INTO bookings (email, phone, companyName, senderName, bookingDetails, userType) 
              VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [email, phone, companyName, senderName, bookingDetails, user.rows.length > 0 ? (user.rows[0].userType || user.rows[0].usertype) : userType]
      );
      if (result.rows.length === 0) {
        return res.status(500).json({ error: 'Failed to save booking' });
      }
      console.log('Booking saved successfully with userType only:', result.rows[0]);
    } catch (fallbackError) {
      console.error('Error saving booking with userType only:', fallbackError);
      
      // Final fallback: try without userType and status
      try {
        const result = await pool.query(
          `INSERT INTO bookings (email, phone, companyName, senderName, bookingDetails) 
                VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [email, phone, companyName, senderName, bookingDetails]
        );
        if (result.rows.length === 0) {
          return res.status(500).json({ error: 'Failed to save booking' });
        }
        console.log('Booking saved successfully without userType and status:', result.rows[0]);
      } catch (finalError) {
        console.error('Error saving booking without userType and status:', finalError);
        return res.status(500).json({ error: 'Failed to save booking', details: finalError.message });
      }
    }
  }

  // Send email
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: 'info.akicc@gmail.com',
    subject: `Booking Request from ${senderName}`,
    html: `
        <h2>New Booking Request</h2>
        <p><strong>Name:</strong> ${senderName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
        <p><strong>Booking Details:</strong></p>
        <p>${bookingDetails}</p>
      `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Email error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
    res.json({ message: 'Booking request sent successfully' });
  });
});

// Send general inquiry email
app.post('/api/contact/inquiry', async (req, res) => {
  const { name, email, topic, description, userType } = req.body;

  if (!name || !email || !topic || !description) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  // Check if user is registered
  const user = await pool.query('SELECT id, userType FROM users WHERE email = $1', [email]);
  
  if (user.rows.length === 0) {
    // User is not registered, save to unregistered_customers
    if (!userType) {
      return res.status(400).json({ error: 'User type is required for unregistered users' });
    }
    
    await pool.query(
      `INSERT INTO unregistered_customers (name, email, phone, companyName, userType, message, messageType) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [name, email, null, null, userType, description, 'inquiry']
    );
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: 'info.akicc@gmail.com',
    subject: `General Inquiry: ${topic}`,
    html: `
      <h2>General Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Topic:</strong> ${topic}</p>
      <p><strong>Description:</strong></p>
      <p>${description}</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Email error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
    res.json({ message: 'Inquiry sent successfully' });
  });
});

// Get bookings (admin only)
app.get('/api/bookings', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const bookings = await pool.query(`
      SELECT b.*, 
             COALESCE(b.userType, u.userType, 'Unknown') as userType,
             COALESCE(b.status, 
               CASE WHEN u.id IS NOT NULL THEN 'Registered' ELSE 'Unregistered' END
             ) as registrationStatus
      FROM bookings b
      LEFT JOIN users u ON b.email = u.email
      ORDER BY b.createdAt DESC
    `);
    
    console.log('Bookings data:', bookings.rows);
    console.log('Sample booking with raw data:', bookings.rows[0]);
    res.json(bookings.rows);
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Delete booking (admin only)
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const result = await pool.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json({ message: 'Booking deleted successfully' });
});

// Get registered customers (admin only)
app.get('/api/registered-customers', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const customers = await pool.query(
      'SELECT id, username, email, userType, createdAt FROM users WHERE userType IN ($1, $2) ORDER BY createdAt DESC',
      ['dealer', 'enduser']
    );
    res.json(customers.rows);
  } catch (err) {
    console.error('Failed to fetch registered customers:', err);
    res.status(500).json({ error: 'Failed to fetch registered customers' });
  }
});

// Get unregistered customers (admin only)
app.get('/api/unregistered-customers', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const customers = await pool.query(
      'SELECT * FROM unregistered_customers ORDER BY createdAt DESC'
    );
    res.json(customers.rows);
  } catch (err) {
    console.error('Failed to fetch unregistered customers:', err);
    res.status(500).json({ error: 'Failed to fetch unregistered customers' });
  }
});

// Delete registered customer (admin only)
app.delete('/api/registered-customers/:id', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // First delete related records (my_lists, sent_lists)
    await pool.query('DELETE FROM my_lists WHERE userId = $1', [req.params.id]);
    await pool.query('DELETE FROM sent_lists WHERE userId = $1', [req.params.id]);
    
    // Then delete the user
    const result = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Registered customer not found' });
    }
    res.json({ message: 'Registered customer deleted successfully' });
  } catch (err) {
    console.error('Failed to delete registered customer:', err);
    res.status(500).json({ error: 'Failed to delete registered customer' });
  }
});

// Delete unregistered customer (admin only)
app.delete('/api/unregistered-customers/:id', authenticateToken, async (req, res) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const result = await pool.query('DELETE FROM unregistered_customers WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Unregistered customer not found' });
    }
    res.json({ message: 'Unregistered customer deleted successfully' });
  } catch (err) {
    console.error('Failed to delete unregistered customer:', err);
    res.status(500).json({ error: 'Failed to delete unregistered customer' });
  }
});

// Get product categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await pool.query('SELECT DISTINCT category FROM product_categories ORDER BY category');
    res.json(categories.rows.map(c => c.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Resize all existing product images (admin only) - DISABLED
app.post('/api/resize-images', authenticateToken, async (req, res) => {
  res.status(400).json({ error: 'Image resizing is disabled. Images are now stored in original quality.' });
});

// Test email endpoint
app.get('/api/test-email', async (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // send to yourself for testing
    subject: 'Test Email from AKICC Server',
    text: 'This is a test email sent from your Node.js server using Gmail SMTP and Nodemailer.'
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Test email sent successfully!' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 