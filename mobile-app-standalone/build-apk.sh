#!/bin/bash
# Build APK for LifeSet mobile app

set -e

cd "$(dirname "$0")"

echo "🚀 Building LifeSet APK..."
echo ""

# Check if EAS is logged in
if ! eas whoami &>/dev/null; then
  echo "❌ Not logged into EAS. Please run: eas login"
  exit 1
fi

# Initialize EAS project if needed
if [ -z "$(grep -o '"projectId": "[^"]*"' app.json | cut -d'"' -f4)" ] || [ "$(grep -o '"projectId": "[^"]*"' app.json | cut -d'"' -f4)" = "" ]; then
  echo "📦 Initializing EAS project..."
  eas project:init --non-interactive || {
    echo "⚠️  Could not auto-initialize. Please run: eas project:init"
    echo "   Then run this script again."
    exit 1
  }
fi

# Build APK
echo "🔨 Building APK (this may take 10-20 minutes)..."
echo ""

eas build --platform android --profile preview --non-interactive

echo ""
echo "✅ Build started! Check progress at: https://expo.dev"
echo ""
echo "Once the build completes, you can:"
echo "1. Download the APK from the EAS dashboard"
echo "2. Or run: eas build:list to see your builds"
echo "3. Install with: adb install <path-to-apk>"

