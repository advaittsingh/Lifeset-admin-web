#!/bin/bash

# LifeSet Admin Panel Deployment Script
# This script helps you deploy the admin panel to various platforms

set -e

echo "🚀 LifeSet Admin Panel Deployment Helper"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please update VITE_API_URL with your backend URL."
    else
        echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
        echo "✅ Created .env file. Please update VITE_API_URL with your backend URL."
    fi
    echo ""
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Build output is in the 'dist' directory"
    echo ""
    echo "Deployment options:"
    echo "1. Vercel:     vercel --prod"
    echo "2. Netlify:    netlify deploy --prod --dir=dist"
    echo "3. Docker:      docker build -t lifeset-admin-web ."
    echo "4. Manual:     Upload 'dist' folder contents to your web server"
    echo ""
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi





















