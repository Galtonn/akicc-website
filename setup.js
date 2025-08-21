#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up AKICC Website...\n');

// Check if Node.js is installed
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v14 or higher.');
  process.exit(1);
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Check if .env file exists
const envFile = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(envFile)) {
  console.log('\n📝 Creating .env file...');
  const envContent = `# Server Configuration
PORT=5000

# JWT Secret Key (change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database Configuration (PostgreSQL)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=akicc
DB_PASSWORD=your-database-password
DB_PORT=5432
`;
  
  fs.writeFileSync(envFile, envContent);
  console.log('✅ Created .env file');
  console.log('⚠️  Please update the .env file with your email credentials');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');

try {
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });
  
  console.log('Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  console.log('✅ All dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update server/.env with your email credentials');
console.log('2. Run "npm run dev" to start the development server');
console.log('3. Open http://localhost:3000 in your browser');
console.log('\n🔑 Default admin account:');
console.log('   Username: admin');
console.log('   Password: admin123');
console.log('   ⚠️  Remember to change the password after first login!');
console.log('\n📚 For more information, see README.md'); 