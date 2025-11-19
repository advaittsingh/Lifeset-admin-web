#!/bin/bash
# Create placeholder assets for LifeSet app
# This script creates simple colored placeholder images

cd "$(dirname "$0")"
mkdir -p assets

# Create a simple icon (1024x1024) - Blue gradient background with "LS" text
# Using ImageMagick if available, otherwise create a simple colored square
if command -v convert &> /dev/null; then
  # Create icon.png (1024x1024)
  convert -size 1024x1024 xc:none \
    -fill "rgb(59,130,246)" \
    -draw "rectangle 0,0 1024,1024" \
    -fill white \
    -font Arial-Bold \
    -pointsize 300 \
    -gravity center \
    -annotate +0+0 "LS" \
    assets/icon.png

  # Create splash.png (1242x2436 for iPhone)
  convert -size 1242x2436 xc:none \
    -fill "rgb(59,130,246)" \
    -draw "rectangle 0,0 1242,2436" \
    -fill white \
    -font Arial-Bold \
    -pointsize 200 \
    -gravity center \
    -annotate +0+0 "LifeSet" \
    assets/splash.png

  # Create adaptive-icon foreground (1024x1024)
  convert -size 1024x1024 xc:none \
    -fill "rgb(59,130,246)" \
    -draw "rectangle 0,0 1024,1024" \
    -fill white \
    -font Arial-Bold \
    -pointsize 300 \
    -gravity center \
    -annotate +0+0 "LS" \
    assets/adaptive-icon.png

  # Create favicon.png (48x48)
  convert -size 48x48 xc:none \
    -fill "rgb(59,130,246)" \
    -draw "rectangle 0,0 48,48" \
    -fill white \
    -font Arial-Bold \
    -pointsize 24 \
    -gravity center \
    -annotate +0+0 "LS" \
    assets/favicon.png

  echo "Assets created successfully using ImageMagick"
else
  echo "ImageMagick not found. Creating placeholder text files."
  echo "Please replace these with actual image files:"
  echo "- assets/icon.png (1024x1024)"
  echo "- assets/splash.png (1242x2436)"
  echo "- assets/adaptive-icon.png (1024x1024)"
  echo "- assets/favicon.png (48x48)"
  
  # Create placeholder text files
  echo "LifeSet Icon (1024x1024)" > assets/icon.png.txt
  echo "LifeSet Splash (1242x2436)" > assets/splash.png.txt
  echo "LifeSet Adaptive Icon (1024x1024)" > assets/adaptive-icon.png.txt
  echo "LifeSet Favicon (48x48)" > assets/favicon.png.txt
fi

