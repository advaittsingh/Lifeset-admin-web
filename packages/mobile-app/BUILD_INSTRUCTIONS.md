# Building LifeSet Mobile App APK

## Prerequisites

1. **EAS Account**: You need an Expo account (free tier works)
2. **EAS CLI**: Already installed (`eas-cli`)
3. **Android Device**: Your phone is connected (detected: RZCY81317EY)

## Quick Build Steps

### Option 1: Interactive Build (Recommended)

```bash
cd packages/mobile-app

# 1. Login to EAS (if not already logged in)
eas login

# 2. Initialize EAS project (if not already done)
eas project:init

# 3. Build APK
eas build --platform android --profile preview
```

### Option 2: Use the Build Script

```bash
cd packages/mobile-app
./build-apk.sh
```

## After Build Completes

1. **Download APK**: The build will be available at https://expo.dev
2. **Install on Phone**:
   ```bash
   # Option A: Download and install manually
   # Download APK from EAS dashboard, then:
   adb install path/to/app.apk
   
   # Option B: Install directly from EAS
   eas build:run -p android --latest
   ```

## Local Build (Advanced)

If you have Android Studio and want to build locally:

```bash
# 1. Generate native code
npx expo prebuild --platform android

# 2. Build with Gradle
cd android
./gradlew assembleRelease

# 3. APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

- **"EAS project not configured"**: Run `eas project:init`
- **"Not logged in"**: Run `eas login`
- **Build fails**: Check the build logs at https://expo.dev
- **APK not installing**: Enable "Install from unknown sources" on your phone

## Current Status

✅ App structure complete
✅ All screens implemented
✅ Navigation configured
✅ Dependencies installed
✅ EAS configuration ready
⏳ Waiting for EAS project initialization and build

