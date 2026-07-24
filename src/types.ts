// Data model types for the flicker film composer

export type Cell = 0 | 1; // 0 = white, 1 = black

export type Resolution = 1 | 2 | 4 | 8; // for sub-frame editing

export interface Frame {
  resolution: Resolution;
  cells: Cell[][];
}

export type Sequence = Frame[];

/**
 * Canonical persisted project document.
 * Used by explicit save/load via a ProjectRepository (future API/PostgreSQL).
 * Distinct from the localStorage draft, which stores only a Sequence.
 */
export interface FlickerProject {
  id: string;
  name: string;
  sequence: Sequence;
  createdAt: string;
  updatedAt: string;
}

/** Input for creating a project; id and timestamps are assigned by the repository. */
export interface CreateFlickerProjectInput {
  name: string;
  sequence: Sequence;
}

/** Partial update payload for an existing project. */
export interface UpdateFlickerProjectInput {
  name?: string;
  sequence?: Sequence;
}

export type GroupingSize = 4 | 8 | 16 | 32;

export type FPS = 12 | 24 | 48;

// Export sizes for the score image
export type ExportCellSize = 4 | 8 | 16 | 32;

export interface ExportOptions {
  cellSize: ExportCellSize;
  showGrid: boolean;
  showFrameNumbers: boolean;
  showSeparators: boolean;
  format: 'png' | 'svg' | 'pdf';
  selectedRange?: {
    start: number;
    end: number;
  };
}
