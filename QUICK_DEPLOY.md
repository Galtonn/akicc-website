# Quick Deployment Guide

## 🚀 Deploy with Random Domains First

### 1. Prepare Your Code
```bash
# Run the deployment script
./deploy.sh  # Linux/Mac
# OR
deploy.bat   # Windows
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push
```

### 3. Deploy Backend (Railway)
- Go to https://railway.app
- Sign up with GitHub
- New Project → Deploy from GitHub repo
- Select your AKICC repository
- Set root directory to `server`
- Add PostgreSQL database: New → Database → PostgreSQL
- Add environment variables:
  - `EMAIL_USER`: your-gmail@gmail.com
  - `EMAIL_PASS`: your-gmail-app-password
  - `JWT_SECRET`: your-secure-random-string
  - Database variables will be auto-provided by Railway
- Get your backend URL: `https://your-app.railway.app`

### 4. Deploy Frontend (Vercel)
- Go to https://vercel.com
- Sign up with GitHub
- New Project → Import your GitHub repo
- Set root directory to `client`
- Add environment variable:
  - `REACT_APP_API_URL`: https://your-backend-url.railway.app
- Get your frontend URL: `https://your-app.vercel.app`

## 🔄 Switch to GoDaddy Domain Later

### 1. Backend Domain
- Railway dashboard → Settings → Domains
- Add custom domain (e.g., `api.yourdomain.com`)
- Update GoDaddy DNS to point to Railway

### 2. Frontend Domain
- Vercel dashboard → Settings → Domains
- Add custom domain (e.g., `www.yourdomain.com`)
- Update GoDaddy DNS to point to Vercel

### 3. Update Environment Variables
- Update `REACT_APP_API_URL` in Vercel to new backend domain

## 💰 Cost Estimate
- Railway: Free tier available, then ~$5/month
- Vercel: Free tier available, then ~$20/month
- GoDaddy Domain: ~$12/year

## 🆘 Need Help?
- See `DEPLOYMENT.md` for detailed instructions
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
