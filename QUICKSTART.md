# Flicker Lab - Quick Start

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Running

```bash
# Navigate to project directory
cd flicker-lab

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5174
```

## 🎨 First Time Usage

### 1. Structure View (Default)
- You'll see a grid of 128 white frames
- **Frame grid** (left): Shows all 128 frames with frame numbers
- **Frame editor** (right): Shows enlarged version of the current frame
- Each frame can be 1x1 (single cell) or subdivided (2x2, 4x4, 8x8)

### 2. Editing a Frame
- **Click** a frame in the grid to select it
- Use the Frame Editor on the right to paint cells:
  - **Click cell**: Paint black (1)
  - **Shift + Click**: Erase to white (0)
- Change sub-frame resolution with buttons (1x1, 2x2, 4x4, 8x8)

### 3. Select Multiple Frames
- **Click + drag** across frames to select a range
- Selected frames highlight in blue
- Works with "Duplicate", "Reverse", "Randomize", "Clear" operations

### 4. Playback
- Click **"Playback"** button in toolbar
- You'll see a canvas with the sequence animated
- Controls:
  - **▶ Play/Pause**: Start/stop animation
  - **🔁 Loop**: Enable looping
  - **FPS**: Choose playback speed (12/24/48 fps)
  - **Slider**: Seek to any frame
  - **Time displayed**: Current time / total duration

### 5. Save Your Work
- Changes are **auto-saved** to browser localStorage
- Click **"Save Project"** to export as `.flickerlab` file
- Can later import to continue


## 💡 Tips & Tricks

### Composition Ideas
- **Flicker**: Alternate black/white frames for epilepsy-safe flicker patterns
- **Gradients**: Slowly fade from white to black or vice versa
- **Patterns**: Create repeating sequences then duplicate
- **Seeds**: Use Randomize (50% density) to generate base, then refine manually
- **Subdivisions**: Use 4x4 or 8x8 for detailed frame structures

### UI Tips
- **Frame grouping** (4/8/16/32): Shows subtle separators for organization
- **Frame numbers**: Displayed at bottom-right of each frame thumbnail
- **Current frame**: Red border indicates active frame
- **Selection info**: Shows "Frames X - Y selected" when range selected

### Keyboard Shortcuts (Future)
- `Space`: Play/Pause
- `Ctrl+S`: Save Project
- `Ctrl+Z`: Undo (not yet implemented)

## 📊 Data Format

Projects are stored as JSON:
```json
{
  "sequence": [
    {
      "resolution": 1,
      "cells": [[0]]  // 0 = white, 1 = black
    },
    // ... 128 frames total
  ]
}
```

Auto-saved to localStorage under key `'flickerlab-project'`

## 🎬 Playback Details

- **Frame duration**: 1000ms / FPS
  - 12 FPS: ~83ms per frame
  - 24 FPS: ~42ms per frame
  - 48 FPS: ~21ms per frame

- **Canvas rendering**: Smooth 60fps, but playback time synchronized to selected FPS
- **Frame syncing**: Click a frame in Structure View to jump playback to that frame


## 🔧 Development

### Build for production
```bash
npm run build
```
Output in `dist/` folder

###View production build locally
```bash
npm run preview
```

### Check for TypeScript errors
```bash
npx tsc --noEmit
```

## 🐛 Troubleshooting

### "Port 5174 already in use"
- Dev server auto-selects next available port
- Check console output for actual URL

### localStorage cleared
- Browser privacy mode might not persist
- Try incognito/private window or allow localStorage

### Frames not updating
- Ensure you're in Structure View
- Check browser console for errors
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Playback not smooth
- Try lower FPS value (12 fps is most stable)
- Close other browser tabs/apps
- Check browser performance with DevTools

## 📚 Resources

- **README.md**: Full feature documentation
- **`.github/copilot-instructions.md`**: Developer guide
- **src/types.ts**: Data model type definitions
- **src/store.ts**: State management logic

## 🎯 Next Steps

1. **Create your first flicker film**: Paint some frames!
2. **Experiment with sub-frames**: Try 4x4 or 8x8 resolution
3. **Use batch operations**: Select frames and apply Randomize or Duplicate
4. **Test playback**: View your creation animated
5. **Share your work**: Export via "Save Project" button

## 🚀 Future Enhancements Coming

- [ ] Export as PNG/SVG score image
- [ ] Export as WebM/MP4 video
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts
- [ ] Pattern templates
- [ ] Collaborative editing (via URL)

---

**Happy creating! 🎨🎬**
