#!/bin/bash

echo "🚀 AKICC Website Deployment Script"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if all dependencies are installed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -d "client/node_modules" ] || [ ! -d "server/node_modules" ]; then
    echo "⚠️  Some dependencies are missing. Installing..."
    npm run install-all
fi

# Build the client
echo "🔨 Building React client..."
cd client
npm run build
cd ..

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push"
echo ""
echo "2. Deploy Backend (Railway):"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub repo"
echo "   - Set root directory to 'server'"
echo "   - Add PostgreSQL database: New → Database → PostgreSQL"
echo "   - Add environment variables:"
echo "     EMAIL_USER=your-gmail@gmail.com"
echo "     EMAIL_PASS=your-gmail-app-password"
echo "     JWT_SECRET=your-secure-random-string"
echo "     (Database variables auto-provided by Railway)"
echo ""
echo "3. Deploy Frontend (Vercel):"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repo"
echo "   - Set root directory to 'client'"
echo "   - Add environment variable:"
echo "     REACT_APP_API_URL=https://your-backend-url.railway.app"
echo ""
echo "4. Test your deployment!"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
