# MoonMic Icon Setup

This document explains how the MoonMic extension icons are set up and how to modify them.

## Current Icon Design

The MoonMic extension features a stylized crescent moon wearing a gaming headset, designed with:
- **Dark purple and blue color scheme** matching the extension's theme
- **Metallic highlights** for a modern, tech-savvy appearance
- **Angular, stylized features** including sharp eyes, nose, and smirk
- **Gaming headset** with microphone boom
- **Inner glow effect** on the moon's crescent

## Icon Files

The extension uses the following icon files:

- `icons/icon.svg` - Source SVG file (editable)
- `icons/icon16.png` - 16x16 pixels (toolbar icon)
- `icons/icon48.png` - 48x48 pixels (extension management page)
- `icons/icon128.png` - 128x128 pixels (Chrome Web Store)

## Regenerating Icons

To regenerate the PNG icons from the SVG source:

1. **Install ImageMagick** (if not already installed):
   ```bash
   # macOS
   brew install imagemagick
   
   # Ubuntu/Debian
   sudo apt-get install imagemagick
   
   # Windows
   # Download from https://imagemagick.org/
   ```

2. **Run the setup script**:
   ```bash
   ./icon_setup.sh
   ```

This will create all three PNG sizes from the SVG source.

## Customizing the Icon

To modify the icon design:

1. **Edit the SVG file** (`icons/icon.svg`)
2. **Regenerate PNG files** using the setup script
3. **Reload the extension** in Chrome

### SVG Structure

The SVG uses several gradients for the metallic effect:
- `bgGradient` - Dark background
- `moonGradient` - Moon body colors
- `moonGlow` - Inner glow effect
- `headsetGradient` - Headset colors
- `metallicHighlight` - Metallic highlights

### Color Palette

The icon uses these main colors:
- Dark purples: `#2D1B69`, `#4A1B8A`, `#1A0B3A`
- Bright purples: `#8B5CF6`, `#7C3AED`, `#6D28D9`
- Metallic highlights: `#E0E7FF`, `#A5B4FC`, `#6366F1`

## Manifest Configuration

The `manifest.json` file is already configured to use these icons:

```json
"icons": {
  "16": "icons/icon16.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
}
```

## Troubleshooting

**Icons not showing up?**
1. Make sure all PNG files exist in the `icons/` directory
2. Check that the paths in `manifest.json` are correct
3. Reload the extension in Chrome (`chrome://extensions/`)

**ImageMagick not found?**
- Install ImageMagick using the commands above
- On macOS, you might need to use `magick` instead of `convert`

**Icon looks pixelated?**
- The SVG source is high quality, but PNG conversion can cause pixelation
- Try editing the SVG to use simpler shapes or larger stroke widths
- Consider using a higher resolution source image 