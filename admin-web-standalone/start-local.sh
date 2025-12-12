#!/bin/bash

# LifeSet Admin Panel - Local Host Startup Script

set -e

echo "🚀 Starting LifeSet Admin Panel on Localhost"
echo "============================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Backend API URL
# Default: http://localhost:3000/api/v1
# Change this if your backend is running on a different port or URL
VITE_API_URL=http://localhost:3000/api/v1
EOF
    echo "✅ Created .env file with default settings"
    echo "   Edit .env if your backend API is on a different URL"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Display configuration
echo "📋 Configuration:"
echo "   - Frontend URL: http://localhost:5173"
if [ -f .env ]; then
    source .env
    echo "   - Backend API: ${VITE_API_URL:-http://localhost:3000/api/v1}"
fi
echo ""

# Check if backend is running (optional check)
echo "⚠️  Make sure your backend is running on port 3000"
echo "   If your backend is on a different port, update VITE_API_URL in .env"
echo ""

# Start the dev server
echo "🌐 Starting development server..."
echo "   The admin panel will open at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev





















