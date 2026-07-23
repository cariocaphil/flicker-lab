# Flicker Lab - File Reference Guide

## 📍 Quick File Locator

### Configuration Files

| File             | Purpose                                 |
| ---------------- | --------------------------------------- |
| `package.json`   | Dependencies, scripts, project metadata |
| `tsconfig.json`  | TypeScript compiler configuration       |
| `vite.config.ts` | Vite build tool settings                |
| `index.html`     | HTML entry point with root div          |
| `.gitignore`     | Git ignore rules                        |

### Core Application

| File            | Purpose                                    |
| --------------- | ------------------------------------------ |
| `src/main.tsx`  | React DOM render entry point               |
| `src/App.tsx`   | Main app component, view switching         |
| `src/index.css` | Global styles (colors, typography, layout) |
| `src/App.css`   | App container layout (flexbox)             |

### Type Definitions

| File           | Purpose                                                                |
| -------------- | ---------------------------------------------------------------------- |
| `src/types.ts` | All TypeScript interfaces and types (Cell, Frame, Sequence, FPS, etc.) |

### State Management

| File           | Purpose                                                     |
| -------------- | ----------------------------------------------------------- |
| `src/store.ts` | Zustand store with all actions and localStorage persistence |

### Components - Navigation & Controls

| File                         | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `src/components/Toolbar.tsx` | Top toolbar with view toggle, FPS selector, PDF Export / Save Project |
| `src/components/Toolbar.css` | Toolbar styling with responsive design                                |
| `src/exportScorePdf.ts`      | PDF score export via jsPDF (full sequence or selection)               |

### Components - Structure View

| File                               | Purpose                                                 |
| ---------------------------------- | ------------------------------------------------------- |
| `src/components/StructureView.tsx` | Main composition interface (frame grid + editing panel) |
| `src/components/StructureView.css` | Structure view layout styles                            |
| `src/components/FrameGrid.tsx`     | Frame timeline grid with selection support              |
| `src/components/FrameGrid.css`     | Grid layout and frame wrapper styles                    |
| `src/components/FrameCell.tsx`     | Individual frame widget with preview                    |
| `src/components/FrameCell.css`     | Frame cell styling (borders, states, numbers)           |

### Components - Frame Editing

| File                              | Purpose                                                    |
| --------------------------------- | ---------------------------------------------------------- |
| `src/components/EditingPanel.tsx` | Right sidebar with resolution buttons and batch operations |
| `src/components/EditingPanel.css` | Panel styling and operation buttons                        |
| `src/components/FrameEditor.tsx`  | Sub-frame cell grid editor (click to paint/erase)          |
| `src/components/FrameEditor.css`  | Editor grid and cell styling                               |

### Components - Playback View

| File                              | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `src/components/PlaybackView.tsx` | Canvas-based animation playback container       |
| `src/components/PlaybackView.css` | Playback view container layout                  |
| `src/components/CanvasPlayer.tsx` | Playback controls (play/pause, loop, seek, FPS) |
| `src/components/CanvasPlayer.css` | Player controls and slider styling              |

### Documentation

| File                              | Purpose                                       |
| --------------------------------- | --------------------------------------------- |
| `README.md`                       | Complete feature documentation and user guide |
| `QUICKSTART.md`                   | Getting started guide for new users           |
| `IMPLEMENTATION.md`               | Technical implementation summary              |
| `.github/copilot-instructions.md` | Developer guide for future enhancements       |

---

## 🔑 Key File Locations by Feature

### Adding a New Store Action

**File**: `src/store.ts`

- Add action function to store interface
- Implement action in return object
- Use `set((state) => ({...}))` pattern for immutable updates
- Updates auto-persist to localStorage

### Creating a New Component

**Files to create**:

1. `src/components/ComponentName.tsx` - Component file
2. `src/components/ComponentName.css` - Component styles
3. Import in parent component and connect via `useFlickerStore()`

### Modifying Styling

**CSS Files**:

- Global: `src/index.css`
- Layout: `src/App.css`
- Per-component: `src/components/*.css`
- Uses BEM naming convention

### Updating Data Model

**File**: `src/types.ts`

- Add/modify TypeScript interfaces
- Update all references in store and components

### Fixing Playback Issues

**Files**:

- `src/components/PlaybackView.tsx` - Animation loop logic
- Look at `drawFrame()` function for Canvas rendering

### PDF Score Export

**Files**:

- `src/exportScorePdf.ts` - jsPDF score rendering and download
- `src/components/Toolbar.tsx` - **PDF Export** button handler

### Tweaking UI Performance

**Check**:

- `src/components/FrameGrid.tsx` - Frame rendering
- `src/components/FrameCell.tsx` - Individual cell styling
- Consider virtualization if 1000+ frames added

---

## 📊 Component Dependency Graph

```
App
├── Toolbar
│   └── useFlickerStore (view, FPS, save)
├── StructureView (when currentView === 'structure')
│   ├── FrameGrid
│   │   └── FrameCell (x128)
│   └── EditingPanel
│       ├── FrameEditor
│       └── useFlickerStore (batch operations)
└── PlaybackView (when currentView === 'playback')
    ├── Canvas element
    └── CanvasPlayer
        └── useFlickerStore (playback controls)
```

---

## 🔄 Data Flow Example: Toggling a Cell

1. **User clicks cell** in FrameCell component
2. **FrameCell calls** `onMouseDown(frameIndex)`
3. **FrameGrid calls** `toggleCell(frameIndex)` action
4. **Store action** updates `sequence[frameIndex].cells[row][col]`
5. **Zustand** triggers re-render of dependent components
6. **localStorage** updated with new sequence
7. **UI reflects** change immediately

---

## 💡 Customization Hotspots

### Change Canvas Size

**File**: `src/components/PlaybackView.tsx`

- Line ~85: `width={400} height={400}` → adjust canvas dimensions

### Change Default FPS

**File**: `src/store.ts`

- Line ~80: `fps: 12` → change to 24 or 48

### Change Frame Count

**File**: `src/store.ts`

- Line ~87: `Array(128)` → change 128 to desired count

### Change Dark Theme Colors

**File**: `src/index.css` / component CSS files

- Search for `#1a1a1a` (dark), `#646cff` (blue), etc.
- Update hex values throughout

### Add Keyboard Shortcuts

**File**: `src/components/PlaybackView.tsx` or `StructureView.tsx`

- Add `useEffect` hook with `keydown` listener
- Map keys to store actions

---

## 🧪 Testing File Changes

After modifying any file:

1. **Components** - Hot reload works in dev mode
2. **Store** - Update immediately if subscribed to hook
3. **Types** - TypeScript compile errors caught immediately
4. **CSS** - Reload in browser automatically
5. **Build** - Run `npm run build` to test production build

---

## 📦 Build Output

After `npm run build`:

- `dist/index.html` - HTML file
- `dist/assets/index-*.css` - Bundled styles
- `dist/assets/index-*.js` - Bundled JavaScript

All ready for static hosting!

---

**Use this guide to quickly navigate the codebase and make targeted improvements! 🚀**
