#!/bin/bash
# Fast APK build and install

cd "$(dirname "$0")"

echo "🚀 Fast Build & Install"
echo "======================="
echo ""

# Initialize if needed
if ! grep -q '"projectId"' app.json 2>/dev/null; then
  echo "Initializing project..."
  printf "y\n" | eas project:init 2>&1 | grep -v "★\|Proceeding"
fi

# Build locally (faster than cloud)
echo "Building APK locally (this is faster)..."
echo ""

eas build --platform android --profile production --local

# Find and install APK
APK=$(find . -name "*.apk" -path "*/build/*" -type f | head -1)

if [ -n "$APK" ] && [ -f "$APK" ]; then
  echo ""
  echo "✅ APK built: $APK"
  echo "📱 Installing on phone..."
  adb install -r "$APK" && echo "✅ Installed!" || echo "⚠️  Install failed, but APK is ready at: $APK"
else
  echo "⚠️  APK not found. Check build output above."
fi

