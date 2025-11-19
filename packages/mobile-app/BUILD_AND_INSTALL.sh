#!/bin/bash
# Build and install LifeSet APK

set -e

cd "$(dirname "$0")"

echo "🚀 Building LifeSet Release APK..."
echo ""

# Step 1: Initialize EAS project (if needed)
if ! grep -q '"projectId"' app.json 2>/dev/null; then
  echo "📦 Initializing EAS project..."
  echo "Please answer 'y' when prompted:"
  eas project:init
fi

# Step 2: Build APK
echo ""
echo "🔨 Building release APK (this takes 10-20 minutes)..."
echo ""

eas build --platform android --profile production

echo ""
echo "✅ Build completed!"
echo ""
echo "📱 Installing on connected device..."

# Step 3: Install on phone
BUILD_ID=$(eas build:list --platform android --limit 1 --json | jq -r '.[0].id' 2>/dev/null || echo "")

if [ -n "$BUILD_ID" ]; then
  echo "Installing build $BUILD_ID..."
  eas build:run -p android --id "$BUILD_ID"
else
  echo "Please install manually:"
  echo "1. Go to https://expo.dev"
  echo "2. Download the latest Android build"
  echo "3. Run: adb install <path-to-apk>"
fi

