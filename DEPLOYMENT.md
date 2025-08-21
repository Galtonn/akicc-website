# AKICC Website Deployment Guide

## Overview
This guide will help you deploy your AKICC website with a random domain first, then switch to your GoDaddy domain later.

## Prerequisites
- GitHub account (to host your code)
- Gmail account with app password setup
- Railway account (for backend) - https://railway.app
- Vercel account (for frontend) - https://vercel.com

## Step 1: Prepare Your Code

### 1.1 Create Environment Variables
Create a `.env` file in the server directory with:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
JWT_SECRET=your-secure-random-string-here
DB_USER=postgres
DB_HOST=localhost
DB_NAME=akicc
DB_PASSWORD=your-database-password
DB_PORT=5432
```

### 1.2 Update API URL
Before deploying, update the API URL in your React app:
- Open `client/src/contexts/AuthContext.js`
- Replace `http://localhost:5000` with your deployed backend URL

## Step 2: Deploy Backend (Railway)

### 2.1 Setup Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your AKICC repository

### 2.2 Configure Environment Variables
In Railway dashboard:
1. Go to your project → Variables tab
2. Add these environment variables:
   - `EMAIL_USER`: your-gmail@gmail.com
   - `EMAIL_PASS`: your-gmail-app-password
   - `JWT_SECRET`: your-secure-random-string
   - `NODE_ENV`: production
   - `DB_USER`: postgres
   - `DB_HOST`: (Railway will provide this)
   - `DB_NAME`: (Railway will provide this)
   - `DB_PASSWORD`: (Railway will provide this)
   - `DB_PORT`: (Railway will provide this)

### 2.3 Setup PostgreSQL Database
1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. This will create a PostgreSQL database and automatically provide the connection variables
3. Railway will automatically link the database to your project

### 2.4 Deploy Settings
1. Set the root directory to `server`
2. Railway will automatically detect it's a Node.js app
3. Deploy will start automatically

### 2.5 Get Your Backend URL
After deployment, Railway will give you a URL like:
`https://your-app-name.railway.app`

## Step 3: Deploy Frontend (Vercel)

### 3.1 Setup Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project" → Import your GitHub repo

### 3.2 Configure Build Settings
- Framework Preset: Create React App
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `build`

### 3.3 Environment Variables
Add in Vercel:
- `REACT_APP_API_URL`: https://your-backend-url.railway.app

### 3.4 Deploy
Click "Deploy" - Vercel will give you a URL like:
`https://your-app-name.vercel.app`

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Test all functionality (login, products, contact form)
3. Check that emails are working
4. Verify file uploads work

## Step 5: Switch to GoDaddy Domain (Later)

### 5.1 Backend Domain (Railway)
1. In Railway dashboard → Settings → Domains
2. Add your custom domain (e.g., api.yourdomain.com)
3. Update DNS records in GoDaddy to point to Railway's IP

### 5.2 Frontend Domain (Vercel)
1. In Vercel dashboard → Settings → Domains
2. Add your custom domain (e.g., www.yourdomain.com)
3. Update DNS records in GoDaddy to point to Vercel's IP

### 5.3 Update Environment Variables
Update `REACT_APP_API_URL` in Vercel to point to your new backend domain.

## Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure your backend URL is correct in frontend
2. **Email not working**: Check Gmail app password and environment variables
3. **Database issues**: Railway provides PostgreSQL, update connection string
4. **File uploads**: Check that uploads directory is properly configured

### Database Setup:
Railway will automatically create and configure your PostgreSQL database. The tables will be created automatically when your server starts for the first time.

## Support
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- GoDaddy DNS Help: https://www.godaddy.com/help

## Cost Estimate
- Railway: Free tier available, then ~$5/month
- Vercel: Free tier available, then ~$20/month
- GoDaddy Domain: ~$12/year
