# 🚀 Quick APK Build Guide

Your phone is connected (RZCY81317EY) and ready for installation!

## Step 1: Initialize EAS Project (One-time setup)

Run this command and answer "Yes" when prompted:

```bash
cd packages/mobile-app
eas project:init
```

When asked: "Would you like to create a project for @advait_singh/lifeset?" → Type `y` and press Enter.

## Step 2: Build APK

Once the project is initialized, run:

```bash
eas build --platform android --profile preview
```

This will:
- Upload your app to EAS servers
- Build the APK (takes 10-20 minutes)
- Provide a download link when complete

## Step 3: Install on Your Phone

After the build completes, you'll get a URL. You can:

**Option A: Download and Install Manually**
1. Open the build URL in your browser
2. Download the APK file
3. Transfer to your phone
4. Install: `adb install path/to/app.apk`

**Option B: Install Directly via ADB**
```bash
# Get the latest build
eas build:run -p android --latest
```

**Option C: Install from Downloaded APK**
```bash
adb install ~/Downloads/app-release.apk
```

## Current Status ✅

- ✅ All app screens implemented
- ✅ Navigation configured  
- ✅ Dependencies installed
- ✅ EAS CLI ready
- ✅ Phone connected (RZCY81317EY)
- ✅ Build configuration ready
- ⏳ **Next: Run `eas project:init` then `eas build --platform android --profile preview`**

## Troubleshooting

- **Build fails?** Check logs at https://expo.dev
- **Can't install?** Enable "Install from unknown sources" in Android settings
- **Need help?** Check BUILD_INSTRUCTIONS.md for detailed info

---

**Ready to build?** Just run the two commands above! 🎉

