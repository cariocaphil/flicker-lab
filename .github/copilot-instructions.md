# Flicker Lab - Development Guide

## Project Overview

Flicker Lab is a React + TypeScript web app for composing flicker films (temporal light patterns). The app combines a grid-based composition UI (Structure View) with a Canvas-based playback system (Playback View).

## Architecture

### Key Components

- **Zustand Store** (`src/store.ts`): Global state management with localStorage persistence
- **StructureView**: Frame grid and composition interface
- **PlaybackView**: Canvas-based animation playback
- **FrameGrid/FrameCell**: Timeline and individual frame display
- **FrameEditor**: Sub-cell editing for layered patterns
- **EditingPanel**: Frame settings and batch operations

### Data Flow

1. User interacts with FrameCell → toggleCell action
2. Action updates sequence in Zustand store
3. Store auto-saves to localStorage
4. PlaybackView renders using Canvas API
5. Current frame syncs between views

## Core concepts

### Frame Model

```typescript
type Cell = 0 | 1; // 0: white, 1: black
type Frame = {
  resolution: 1 | 2 | 4 | 8; // sub-frame grid size
  cells: Cell[][]; // 2D grid of cells
};
type Sequence = Frame[]; // Array of 128+ frames
```

### State Structure

- `sequence`: Array of Frame objects
- `currentFrameIndex`: Active frame in grid
- `selection`: Fram range for batch operations
- `fps`: Playback speed (12/24/48)
- `isPlaying/isLooping`: Playback state
- `groupingSize`: Visual separator interval

## Common Tasks

### Adding a New Feature

1. **Add state** to `useFlickerStore` in `store.ts`
2. **Create UI component** in `src/components/`
3. **Connect via hooks**: `const { state, action } = useFlickerStore()`
4. **Auto-saves to localStorage** (handled by store)

### Modifying Frame Operations

- Edit `toggleCell`, `paintCells`, `eraseCells` in store
- All operations trigger localStorage save
- Update dependency arrays in useEffect hooks

### Improving Playback

- Modify `drawFrame()` in PlaybackView.tsx
- Update Canvas rendering logic
- Test with different FPS values and resolutions

### Export Functionality

- **PDF score**: Implemented in `src/exportScorePdf.ts`, triggered from Toolbar **PDF Export**
- Uses jsPDF to draw frames (including sub-frame grids), numbers, and group separators
- Respects current selection range when present; otherwise exports the full sequence
- For PNG/SVG score images or video export: extend export helpers similarly (canvas/Blob download)

## Best Practices

### TypeScript

- Use `type` for component props interfaces
- Define data model types in `types.ts`
- Strongly type Zustand callbacks

### React

- Use `useCallback()` for memoized callbacks
- Clean up effects with return statements
- Destructure from hooks at component top

### Performance

- Canvas rendering keeps playback smooth
- Frame grid scrollable with flex overflow
- Heavy state updates are granular

### Styling

- BEM convention for CSS classes
- Responsive design with media queries
- Dark theme by default

## File Structure Best Practices

- Component files: `ComponentName.tsx` + `ComponentName.css`
- Keep related styles in separate CSS files
- Constants in separate files if reused
- Utilities exported from `utils.ts` (if added)

## Store Pattern (Zustand)

```typescript
export const useFlickerStore = create<FlickerStore>((set, get) => ({
  // State
  sequence: [],

  // Actions using set()
  toggleCell: (index) =>
    set((state) => ({
      // Return only changed fields
    })),

  // Derived actions using get()
  someAction: () => {
    const { sequence } = get();
    // use current state
  },
}));
```

## Common Patterns

### Selection Range

```typescript
// User selects frames 10-20
setSelection({ start: 10, end: 20 })

// Batch operation on selection
frames.slice(start, end + 1).forEach(...)

// Clear after operation
setSelection(null)
```

### Frame Editing

```typescript
// Modify single frame cell
paintCells(frameIndex, [{ row, col }]);

// Change frame resolution
setFrameResolution(frameIndex, 4); // 4x4 grid
```

### Playback Sync

```typescript
// Structure clicking syncs to Playback
onFrameClick -> setCurrentFrameIndex -> drawFrame()

// Playback scrubbing syncs to Structure
onSeek -> setCurrentFrameIndex -> visually updates grid
```

## Testing Workflow

1. Make changes to component
2. Hot-reload auto-applies (Vite)
3. Check browser console for errors
4. Verify store persistence: localStorage.getItem('flickerlab-project')
5. Build with `npm run build` to catch TS errors

## Debugging Tips

- Use React DevTools for component hierarchy
- Check Zustand store state in browser console: `useFlickerStore.getState()`
- Canvas issues: Check `canvasRef.current` context
- localStorage: `localStorage.getItem('flickerlab-project')`

## Future Development Areas

1. **Export**: PNG/SVG score image, WebM/MP4 video (PDF score already shipped)
2. **Undo/Redo**: Implement History stack
3. **Keyboard shortcuts**: Map events to actions
4. **Themes**: Light/dark mode toggle
5. **Templates**: Pre-made pattern library
6. **Collaboration**: Real-time URL sync

## Performance Considerations

- Canvas rendering: Only redraw on frame change
- Frame grid: Virtualization for 1000+ frames
- State: Use `immer` middleware if deep nesting
- Bundle: Tree-shake unused deps

## Accessibility

- Alt text for visual elements
- Keyboard navigation support (TODO)
- Screen reader compatibility (TODO)
- Color contrast for dark theme

---

**Last updated**: April 2026
**Version**: 0.0.1 MVP
