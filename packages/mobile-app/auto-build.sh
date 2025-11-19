#!/bin/bash
# Automated APK build and install script

set -e

cd "$(dirname "$0")"

echo "🚀 LifeSet APK Build & Install"
echo "================================"
echo ""

# Check if logged in
if ! eas whoami &>/dev/null; then
  echo "❌ Not logged into EAS. Please run: eas login"
  exit 1
fi

echo "✅ Logged in as: $(eas whoami)"
echo ""

# Check if project is initialized
if ! grep -q '"projectId"' app.json 2>/dev/null || [ -z "$(grep -o '"projectId": "[^"]*"' app.json | cut -d'"' -f4)" ]; then
  echo "📦 Initializing EAS project..."
  echo ""
  echo "⚠️  This requires interactive input."
  echo "   Please answer 'y' when prompted to create the project."
  echo ""
  read -p "Press Enter to continue..." 
  eas project:init
  echo ""
fi

# Get project ID
PROJECT_ID=$(grep -o '"projectId": "[^"]*"' app.json 2>/dev/null | cut -d'"' -f4 || echo "")

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Project ID not found. Please run 'eas project:init' manually."
  exit 1
fi

echo "✅ Project ID: $PROJECT_ID"
echo ""

# Build APK
echo "🔨 Building release APK..."
echo "   This will take 10-20 minutes. You can monitor progress at:"
echo "   https://expo.dev/accounts/$(eas whoami)/projects/lifeset/builds"
echo ""

eas build --platform android --profile production --non-interactive

echo ""
echo "✅ Build completed!"
echo ""

# Check if device is connected
if adb devices | grep -q "device$"; then
  echo "📱 Device detected. Installing APK..."
  echo ""
  
  # Try to install using EAS
  if eas build:run -p android --latest --non-interactive 2>/dev/null; then
    echo "✅ APK installed successfully!"
  else
    echo "⚠️  Automatic install failed. Please install manually:"
    echo ""
    echo "1. Go to: https://expo.dev/accounts/$(eas whoami)/projects/lifeset/builds"
    echo "2. Download the latest Android build"
    echo "3. Run: adb install <path-to-apk>"
  fi
else
  echo "⚠️  No device connected. Please connect your phone and run:"
  echo "   adb install <path-to-downloaded-apk>"
fi

echo ""
echo "🎉 Done!"

