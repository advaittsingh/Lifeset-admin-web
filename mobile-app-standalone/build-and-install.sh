#!/bin/bash
# Interactive script to build and install LifeSet APK

set -e

cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     LifeSet - APK Build & Install Script                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check login
if ! eas whoami &>/dev/null; then
  echo "❌ Not logged into EAS"
  echo "   Please run: eas login"
  exit 1
fi

echo "✅ Logged in as: $(eas whoami)"
echo ""

# Check device
if adb devices | grep -q "device$"; then
  DEVICE=$(adb devices | grep "device$" | head -1 | cut -f1)
  echo "✅ Phone connected: $DEVICE"
else
  echo "⚠️  No phone detected. Connect your phone via USB and enable USB debugging."
  echo "   The APK will still be built, but you'll need to install it manually."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Initialize project
if ! grep -q '"projectId"' app.json 2>/dev/null; then
  echo "📦 Step 1: Initializing EAS project..."
  echo ""
  echo "   When prompted: 'Would you like to create a project for @advait_singh/lifeset?'"
  echo "   Answer: y (yes)"
  echo ""
  read -p "   Press Enter to continue..."
  echo ""
  
  eas project:init
  
  if ! grep -q '"projectId"' app.json 2>/dev/null; then
    echo ""
    echo "❌ Project initialization failed. Please run 'eas project:init' manually."
    exit 1
  fi
  
  PROJECT_ID=$(grep -o '"projectId": "[^"]*"' app.json | cut -d'"' -f4)
  echo "   ✅ Project created: $PROJECT_ID"
  echo ""
else
  PROJECT_ID=$(grep -o '"projectId": "[^"]*"' app.json | cut -d'"' -f4)
  echo "✅ Project already initialized: $PROJECT_ID"
  echo ""
fi

# Step 2: Build
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔨 Step 2: Building release APK..."
echo ""
echo "   This will take 10-20 minutes."
echo "   You can monitor progress at: https://expo.dev"
echo ""
read -p "   Press Enter to start the build..."
echo ""

eas build --platform android --profile production

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Build completed!"
echo ""

# Step 3: Install
if adb devices | grep -q "device$"; then
  echo "📱 Step 3: Installing on your phone..."
  echo ""
  
  if eas build:run -p android --latest 2>/dev/null; then
    echo ""
    echo "🎉 APK installed successfully on your phone!"
  else
    echo ""
    echo "⚠️  Automatic install failed. Please install manually:"
    echo ""
    echo "   1. Go to: https://expo.dev/accounts/$(eas whoami)/projects/lifeset/builds"
    echo "   2. Download the latest Android build (APK)"
    echo "   3. Run: adb install <path-to-apk>"
    echo ""
    echo "   Or transfer the APK to your phone and install it directly."
  fi
else
  echo "📱 Step 3: Manual installation required"
  echo ""
  echo "   No device connected. To install:"
  echo ""
  echo "   1. Go to: https://expo.dev/accounts/$(eas whoami)/projects/lifeset/builds"
  echo "   2. Download the latest Android build (APK)"
  echo "   3. Transfer to your phone and install, or:"
  echo "   4. Run: adb install <path-to-apk>"
  echo ""
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    All Done! 🎉                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

