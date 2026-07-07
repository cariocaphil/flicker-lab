import { create } from 'zustand';
import { Frame, Sequence, GroupingSize, FPS, Resolution, Cell } from './types';

interface SelectionRange {
  start: number;
  end: number;
}

interface FlickerStore {
  // Sequence data
  sequence: Sequence;
  
  // UI State
  currentView: 'structure' | 'playback';
  currentFrameIndex: number;
  currentSubFrameIndex: number | null;
  groupingSize: GroupingSize;
  fps: FPS;
  isPlaying: boolean;
  isLooping: boolean;
  selection: SelectionRange | null;
  
  // Actions
  setCurrentView: (view: 'structure' | 'playback') => void;
  setCurrentFrameIndex: (index: number) => void;
  setCurrentSubFrameIndex: (index: number | null) => void;
  setGroupingSize: (size: GroupingSize) => void;
  setFPS: (fps: FPS) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLooping: (looping: boolean) => void;
  setSelection: (range: SelectionRange | null) => void;
  
  // Frame operations
  toggleCell: (frameIndex: number, row: number, col: number) => void;
  paintCells: (frameIndex: number, cells: Array<{ row: number; col: number }>) => void;
  eraseCells: (frameIndex: number, cells: Array<{ row: number; col: number }>) => void;
  setFrameResolution: (frameIndex: number, resolution: Resolution) => void;
  invertFrame: (frameIndex: number) => void;
  
  // Selection operations
  duplicateSelection: () => void;
  reverseSelection: () => void;
  randomizeSelection: (density: number) => void;
  clearSelection: () => void;
  
  // File operations
  saveProject: (name: string) => void;
  loadProject: (data: string) => void;
}

// Helper to create default frame
const createDefaultFrame = (): Frame => ({
  resolution: 1,
  cells: [[0]],
});

// Helper to resize frame cells
const resizeFrameCells = (cells: Cell[][], newResolution: Resolution): Cell[][] => {
  const oldRes = Math.sqrt(cells.length);
  const newCells = Array(newResolution).fill(null).map(() => Array(newResolution).fill(0));
  
  // Copy existing cells, scaling appropriately
  for (let i = 0; i < Math.min(oldRes, newResolution); i++) {
    for (let j = 0; j < Math.min(oldRes, newResolution); j++) {
      newCells[i][j] = cells[i]?.[j] ?? 0;
    }
  }
  return newCells;
};

export const useFlickerStore = create<FlickerStore>((set, get) => {
  // Initialize with localStorage
  const savedData = localStorage.getItem('flickerlab-project');
  const initialSequence: Sequence = savedData 
    ? (() => {
        try {
          return JSON.parse(savedData);
        } catch {
          // Initialize with 128 blank frames
          return Array(128).fill(null).map(() => createDefaultFrame());
        }
      })()
    : Array(128).fill(null).map(() => createDefaultFrame());

  // Auto-save to localStorage on any change
  const saveToLocalStorage = (state: FlickerStore) => {
    localStorage.setItem('flickerlab-project', JSON.stringify(state.sequence));
  };

  return {
    sequence: initialSequence,
    currentView: 'structure',
    currentFrameIndex: 0,
    currentSubFrameIndex: null,
    groupingSize: 8,
    fps: 12,
    isPlaying: false,
    isLooping: false,
    selection: null,

    setCurrentView: (view) => set({ currentView: view }),
    setCurrentFrameIndex: (index) => set({ currentFrameIndex: index }),
    setCurrentSubFrameIndex: (index) => set({ currentSubFrameIndex: index }),
    setGroupingSize: (size) => set({ groupingSize: size }),
    setFPS: (fps) => set({ fps }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setIsLooping: (looping) => set({ isLooping: looping }),
    setSelection: (range) => set({ selection: range }),

    toggleCell: (frameIndex, row, col) => set((state) => {
      const newSequence = [...state.sequence];
      const frame = { ...newSequence[frameIndex] };
      const cells = frame.cells.map(r => [...r]);
      cells[row][col] = cells[row][col] === 0 ? 1 : 0;
      frame.cells = cells;
      newSequence[frameIndex] = frame;
      const newState = { sequence: newSequence };
      saveToLocalStorage({ ...state, ...newState });
      return newState;
    }),

    paintCells: (frameIndex, cells) => set((state) => {
      const newSequence = [...state.sequence];
      const frame = { ...newSequence[frameIndex] };
      const frameCells = frame.cells.map(r => [...r]);
      cells.forEach(({ row, col }) => {
        if (frameCells[row]?.[col] !== undefined) {
          frameCells[row][col] = 1;
        }
      });
      frame.cells = frameCells;
      newSequence[frameIndex] = frame;
      const newState = { sequence: newSequence };
      saveToLocalStorage({ ...state, ...newState });
      return newState;
    }),

    eraseCells: (frameIndex, cells) => set((state) => {
      const newSequence = [...state.sequence];
      const frame = { ...newSequence[frameIndex] };
      const frameCells = frame.cells.map(r => [...r]);
      cells.forEach(({ row, col }) => {
        if (frameCells[row]?.[col] !== undefined) {
          frameCells[row][col] = 0;
        }
      });
      frame.cells = frameCells;
      newSequence[frameIndex] = frame;
      const newState = { sequence: newSequence };
      saveToLocalStorage({ ...state, ...newState });
      return newState;
    }),

    setFrameResolution: (frameIndex, resolution) => set((state) => {
      const newSequence = [...state.sequence];
      const frame = { ...newSequence[frameIndex] };
      frame.resolution = resolution;
      frame.cells = resizeFrameCells(frame.cells, resolution);
      newSequence[frameIndex] = frame;
      const newState = { sequence: newSequence };
      saveToLocalStorage({ ...state, ...newState });
      return newState;
    }),
    invertFrame: (frameIndex: number) => set((state) => {
      const newSequence = [...state.sequence];
      const frame = { ...newSequence[frameIndex] };
      const cells = frame.cells.map(row =>
        row.map(cell => (cell === 0 ? 1 : 0))
      );
      frame.cells = cells;
      newSequence[frameIndex] = frame;
      const newState = { sequence: newSequence };
      saveToLocalStorage({ ...state, ...newState });
      return newState;
    }),
    duplicateSelection: () => set((state) => {
      if (!state.selection) return {};
      const { start, end } = state.selection;
      const newSequence = [...state.sequence];
      for (let i = start; i <= end; i++) {
        if (i + (end - start + 1) < newSequence.length) {
          newSequence[i + (end - start + 1)] = JSON.parse(JSON.stringify(newSequence[i]));
        }
      }
      const newState = { sequence: newSequence };
      saveToLocalStorage({ ...state, ...newState });
      return newState;
    }),

    reverseSelection: () => set((state) => {
      if (!state.selection) return {};
      const { start, end } = state.selection;
      const newSequence = [...state.sequence];
      const selected = newSequence.slice(start, end + 1);
      selected.reverse();
      newSequence.splice(start, end - start + 1, ...selected);
      const newState = { sequence: newSequence };
      saveToLocalStorage({ ...state, ...newState });
      return newState;
    }),

    randomizeSelection: (density) => set((state) => {
      if (!state.selection) return {};
      const { start, end } = state.selection;
      const newSequence = [...state.sequence];
      for (let i = start; i <= end; i++) {
        const frame = { ...newSequence[i] };
        const cells = frame.cells.map(row =>
          row.map(() => Math.random() < density / 100 ? 1 : 0)
        );
        frame.cells = cells;
        newSequence[i] = frame;
      }
      const newState = { sequence: newSequence };
      saveToLocalStorage({ ...state, ...newState });
      return newState;
    }),

    clearSelection: () => set((state) => {
      if (!state.selection) return {};
      const { start, end } = state.selection;
      const newSequence = [...state.sequence];
      for (let i = start; i <= end; i++) {
        newSequence[i] = createDefaultFrame();
      }
      const newState = { sequence: newSequence };
      saveToLocalStorage({ ...state, ...newState });
      return newState;
    }),

    saveProject: (name) => {
      const state = get();
      const data = {
        name,
        timestamp: new Date().toISOString(),
        sequence: state.sequence,
      };
      const dataStr = JSON.stringify(data);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}-${Date.now()}.flickerlab`;
      link.click();
      URL.revokeObjectURL(url);
    },

    loadProject: (dataString) => set(() => {
      try {
        const data = JSON.parse(dataString);
        return { sequence: data.sequence || [] };
      } catch {
        return {};
      }
    }),
  };
});
