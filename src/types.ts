// Data model types for the flicker film composer

export type Cell = 0 | 1; // 0 = white, 1 = black

export type Resolution = 1 | 2 | 4 | 8; // for sub-frame editing

export interface Frame {
  resolution: Resolution;
  cells: Cell[][];
}

export type Sequence = Frame[];

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
