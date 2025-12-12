
# LifeSet App Assets

## Required Assets

Please create or replace these files with proper images:

1. **icon.png** - 1024x1024 pixels
   - App icon for iOS and Android
   - Should be square with no transparency

2. **splash.png** - 1242x2436 pixels (or 2048x2732 for newer devices)
   - Splash screen image
   - Full screen image shown on app launch

3. **adaptive-icon.png** - 1024x1024 pixels
   - Android adaptive icon foreground
   - Should work on various background colors

4. **favicon.png** - 48x48 pixels
   - Web favicon

## Quick Creation

You can use online tools like:
- https://www.appicon.co/
- https://www.favicon-generator.org/
- https://makeappicon.com/

Or use ImageMagick:
```bash
# Install ImageMagick first
brew install imagemagick

# Then create assets
convert -size 1024x1024 xc:#3b82f6 -fill white -font Arial-Bold -pointsize 300 -gravity center -annotate +0+0 "LS" icon.png
```
