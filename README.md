# Flicker Lab - Film Composer

A React + TypeScript web application for composing flicker films inspired by structural cinema (e.g., Arnulf Rainer). Design temporal light patterns through a grid-based UI and preview them in real-time.

## Overview

**Flicker Lab** is a visual composition tool for time and light. It combines the aesthetics of step sequencers (like those in music production) with a pixel editor interface, allowing artists to create mesmerizing flicker films.

## Features

### 🎨 Dual View System

- **Structure View** (default): Compose your sequence frame-by-frame
- **Playback View**: Preview the animation with adjustable FPS and controls

### 🧱 Frame Grid & Composition

- Timeline of 128 frames, each editable as black (1) or white (0)
- Click to toggle frame states
- Drag to paint multiple frames
- Shift+drag to erase
- Visual frame numbering and separators

### 🎼 Frame Grouping

- Visual separators every 4, 8, 16, or 32 frames
- Helps organize large sequences

### 🔲 Sub-frame Editing (Key Feature)

- Expand any frame to edit internal structure
- 4 resolution levels:
  - **1x1**: Single cell (default)
  - **2x2**: 4 cells
  - **4x4**: 16 cells
  - **8x8**: 64 cells
- Paint individual sub-cells for micro-patterns

### 🎼 Batch Editing Tools

When frames are selected:

- **Duplicate**: Copy selected range
- **Reverse**: Reverse frame order
- **Randomize**: Fill with random black/white (adjustable density %)
- **Clear**: Reset selected frames to white

### 🎬 Playback Controls

- Play/Pause/Loop
- FPS selector: 12 fps (default), 24 fps, 48 fps
- Real-time frame info display
- Canvas-based rendering for performance
- Current frame sync with Structure View

### 💾 Project Management

- **Auto-save (draft)**: Current sequence persists to localStorage under `flickerlab-project`
- **Manual Save**: Export project as `.flickerlab` JSON file (`name`, `timestamp`, `sequence`)
- **Persistent State**: Resume the local draft across sessions
- **Project repository (planned API)**: `ProjectRepository` interface + `FlickerProject` model prepare for PostgreSQL-backed saves

### 📊 Export

- **PDF Export**: Download the sequence as a PDF score
  - Full sequence, or selected range when frames are selected
  - Frame numbers and group separators
  - Sub-frame grids preserved for higher resolutions
- **Export Video**: WebM/MP4 output (future)

## Data Model

```typescript
type Cell = 0 | 1; // white | black

type Frame = {
  resolution: 1 | 2 | 4 | 8;
  cells: Cell[][];
};

type Sequence = Frame[]; // the visual score (timeline)

/** Canonical document for explicitly saved projects (future API). */
interface FlickerProject {
  id: string;
  name: string;
  sequence: Sequence;
  createdAt: string;
  updatedAt: string;
}
```

**Persistence split**

- **Draft**: localStorage stores only a `Sequence` (auto-updated on edits).
- **Explicit projects**: `FlickerProject` + `ProjectRepository` (`src/services/projectRepository.ts`) define list/get/create/update/delete for a future API. Not wired to the UI yet.
- **File download**: `.flickerlab` remains `{ name, timestamp, sequence }` for compatibility.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone/navigate to project
cd flicker-lab

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will open at `http://localhost:5174/` (or next available port)

### Development

```bash
# Watch mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Quality checks (same as CI)
npm run format:check
npm run lint
npm test
```

## Development Workflow

Work happens on feature branches. Continuous Integration validates every change; production deploys only after a merge to `main`.

1. **Develop on a feature branch** — create a branch off `main` for each change.
2. **Every push runs CI** — the **CI** GitHub Actions workflow runs format, lint, test, and build.
3. **Pull Requests must pass CI** — enable branch protection so merges into `main` require the CI check (see [docs/github-branch-protection.md](docs/github-branch-protection.md)).
4. **Merge deploys** — after merging into `main`, the Azure Static Web Apps workflow deploys the latest build to production.

```text
Feature Branch
      │
      ▼
GitHub Actions (CI)
      │
  format
  lint
  test
  build
      │
      ▼
Pull Request
      │
      ▼
Merge into main
      │
      ▼
Azure Static Web Apps
      │
      ▼
Production
```

CI quality checks and Azure deployment are separate workflows: CI gates merges; Azure only deploys.

## Usage Guide

### Structure View

1. **Selecting Frames**
   - Click a frame to select it
   - Click and drag to select a range
   - Selection highlights in blue

2. **Editing Frames**
   - Click the frame number or content to jump to it
   - Use the Frame Editor on the right panel
   - Change resolution with the 1x1 / 2x2 / 4x4 / 8x8 buttons
   - Click cells to paint (black), Shift+Click to erase (white)

3. **Batch Operations** (when frames selected)
   - **Duplicate**: Copies selected range after current selection
   - **Reverse**: Reverses frame order in selection
   - **Randomize**: Fills with % density of black cells
   - **Clear**: Sets all selected frames to white

4. **Frame Grouping**
   - Choose grouping size (4, 8, 16, 32)
   - Visual separators appear at boundaries

### Playback View

1. **Controls**
   - ▶ Play/Pause
   - 🔁 Loop toggle
   - Time slider for seeking
   - FPS selector (12/24/48 fps)

2. **Display**
   - Canvas shows current frame
   - Frame number and total displayed
   - Time in MM:SS format

3. **Synchronization**
   - Playback position syncs with Structure View
   - Click frame in Structure jumps playback

### Saving & Loading

**Auto-save (browser draft)**:

- Sequence automatically saved to localStorage key `flickerlab-project`
- App resumes the draft where you left off
- Does not store project name, id, or timestamps

**Manual Save (file download)**:

- Click "Save Project" button
- Enter project name
- `.flickerlab` file downloads (`name`, `timestamp`, `sequence`)
- Later: Load via file input (coming soon)

**Explicit project storage (architecture ready)**:

- `FlickerProject` / `CreateFlickerProjectInput` in `src/types.ts`
- `ProjectRepository` in `src/services/projectRepository.ts`
- Future API/PostgreSQL adapter will implement the repository; local draft behavior stays separate

**PDF Export**:

- Click "PDF Export" in the toolbar
- Downloads a PDF score of the full sequence (or the current selection)
- Includes frame numbers, group separators, and sub-frame grids

## Project Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx              # Main app component
├── types.ts             # Domain types (Frame, Sequence, FlickerProject, …)
├── store.ts             # Zustand state + localStorage draft
├── exportScorePdf.ts    # PDF score export (jsPDF)
├── services/
│   └── projectRepository.ts  # ProjectRepository interface (future API)
├── index.css            # Global styles
├── App.css              # App layout styles
└── components/
    ├── Toolbar.tsx      # Top toolbar with controls
    ├── StructureView.tsx # Composition grid view
    ├── FrameGrid.tsx    # Frame timeline
    ├── FrameCell.tsx    # Individual frame display
    ├── FrameEditor.tsx  # Sub-frame cell editor
    ├── EditingPanel.tsx # Frame settings & batch ops
    ├── PlaybackView.tsx # Canvas playback
    ├── CanvasPlayer.tsx # Playback controls
    └── *.css            # Component styles
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires Canvas API support

## Keyboard Shortcuts (Future)

- `Space`: Play/Pause
- `Ctrl+S` / `Cmd+S`: Save project
- `Ctrl+Z` / `Cmd+Z`: Undo (coming soon)
- `Ctrl+Y` / `Cmd+Y`: Redo (coming soon)

## Tech Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Zustand**: Lightweight state management
- **jsPDF**: PDF score export
- **Canvas API**: Playback rendering
- **localStorage**: Automatic sequence draft
- **ProjectRepository**: Interface for future API-backed projects

## State Management (Zustand)

The `useFlickerStore` hook provides:

- Sequence data
- UI state (view, FPS, selection)
- Frame operations (toggle, paint, erase, resize)
- Batch operations (duplicate, reverse, randomize, clear)
- File I/O (`.flickerlab` download / `loadProject` helper)

Sequence edits auto-persist to the localStorage **draft**. Explicit cloud/DB projects will go through `ProjectRepository`, not the store’s draft key.

PDF score export is handled by `exportScorePdf` (triggered from the toolbar **PDF Export** button).

## Future Enhancements

- [ ] API-backed `ProjectRepository` (PostgreSQL)
- [ ] Wire UI to list/open/save remote projects
- [ ] Undo/Redo stack
- [ ] Video export (WebM/MP4)
- [ ] PNG/SVG score image export
- [ ] Frame-by-frame animation editor
- [ ] Preset patterns library
- [ ] Timeline zoom/scroll
- [ ] Dark/Light theme toggle
- [ ] Keyboard shortcuts
- [ ] Project templates
- [ ] Real-time sync via URL (shareable links)
- [ ] Keyboard shortcuts for tools

## Inspiration

- **Arnulf Rainer** - Legendary flicker film by Peter Kubelka
- **Step sequencers** - Music production workflow
- **Pixel art editors** - Grid-based editing paradigm
- **Minimalist art** - Focus on essential elements (light/time)

## License

MIT

## Contributing

Contributions welcome! This is an open-source project designed for artists and developers interested in generative and structural cinema.

## Contact & Support

For issues, feature requests, or feedback:

- Open an issue on GitHub
- Experiment with the tool and share your creations!

---

**Enjoy creating flicker films! 🎬✨**
