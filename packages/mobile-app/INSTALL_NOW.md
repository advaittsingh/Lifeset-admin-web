# 🚀 Build & Install LifeSet APK - Quick Steps

Your phone is connected and ready! Follow these steps:

## Step 1: Initialize EAS Project (One-time, ~30 seconds)

```bash
cd packages/mobile-app
eas project:init
```

**When prompted:** "Would you like to create a project for @advait_singh/lifeset?"  
**Answer:** Type `y` and press Enter

## Step 2: Build Release APK (~10-20 minutes)

```bash
eas build --platform android --profile production
```

This will:
- Upload your app code
- Build the APK on Expo's servers
- Give you a download link when done

**You can monitor progress at:** https://expo.dev

## Step 3: Install on Your Phone

After the build completes, you'll see a URL. Install with:

```bash
# Option 1: Direct install (recommended)
eas build:run -p android --latest

# Option 2: Download and install manually
# 1. Open the build URL in browser
# 2. Download the APK
# 3. Install:
adb install ~/Downloads/app-release.apk
```

## Alternative: Use the Build Script

```bash
cd packages/mobile-app
./BUILD_AND_INSTALL.sh
```

## Current Status ✅

- ✅ All app code complete
- ✅ Assets created
- ✅ Git initialized
- ✅ EAS configured
- ✅ Phone connected (RZCY81317EY)
- ✅ Ready to build!

## Troubleshooting

- **"EAS project not configured"**: Run `eas project:init` first
- **Build takes long**: Normal! First build is 15-20 minutes
- **Install fails**: Enable "Install from unknown sources" in Android settings

---

**Ready?** Just run the two commands above! 🎉

