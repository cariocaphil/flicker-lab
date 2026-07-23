import { jsPDF } from 'jspdf';
import { Sequence, GroupingSize } from './types';

export interface ScorePdfOptions {
  cellSize?: number;
  framesPerRow?: number;
  showFrameNumbers?: boolean;
  showSeparators?: boolean;
  groupingSize?: GroupingSize;
  selectedRange?: { start: number; end: number };
  filename?: string;
}

/**
 * Export the flicker sequence as a PDF score.
 * Frames are drawn as black/white cells (with sub-frame grids when resolution > 1).
 */
export function exportScorePdf(
  sequence: Sequence,
  options: ScorePdfOptions = {}
): void {
  const {
    cellSize = 16,
    framesPerRow = 16,
    showFrameNumbers = true,
    showSeparators = true,
    groupingSize = 8,
    selectedRange,
    filename = `flicker-score-${Date.now()}.pdf`,
  } = options;

  const start = selectedRange?.start ?? 0;
  const end = selectedRange?.end ?? sequence.length - 1;
  const frames = sequence.slice(start, end + 1);

  if (frames.length === 0) return;

  const gap = 2;
  const separatorGap = showSeparators ? 6 : gap;
  const numberHeight = showFrameNumbers ? 10 : 0;
  const margin = 40;
  const titleHeight = 28;

  // Width of a full row of frames, including separators between groups
  let maxRowWidth = 0;
  for (let c = 0; c < framesPerRow; c++) {
    maxRowWidth += cellSize;
    if (c < framesPerRow - 1) {
      const isGroupBoundary = showSeparators && (c + 1) % groupingSize === 0;
      maxRowWidth += isGroupBoundary ? separatorGap : gap;
    }
  }

  const rowHeight = cellSize + numberHeight + 8;
  const numRows = Math.ceil(frames.length / framesPerRow);
  const contentHeight = numRows * rowHeight;

  const pageWidth = Math.max(maxRowWidth + margin * 2, 200);
  const pageHeight = contentHeight + margin * 2 + titleHeight;

  const doc = new jsPDF({
    orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [pageWidth, pageHeight],
  });

  // Title
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text('Flicker Lab — Score', margin, margin);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const rangeLabel =
    selectedRange != null
      ? `Frames ${start + 1}–${end + 1}`
      : `Frames 1–${sequence.length}`;
  doc.text(rangeLabel, margin, margin + 14);

  const originX = margin;
  const originY = margin + titleHeight;

  frames.forEach((frame, i) => {
    const row = Math.floor(i / framesPerRow);
    const col = i % framesPerRow;
    const absoluteIndex = start + i;

    // X position within row, accounting for group separators
    let x = originX;
    for (let c = 0; c < col; c++) {
      const frameAbs = start + row * framesPerRow + c;
      const isGroupBoundary =
        showSeparators && (frameAbs + 1) % groupingSize === 0;
      x += cellSize + (isGroupBoundary ? separatorGap : gap);
    }

    const y = originY + row * rowHeight;

    // Draw frame cells
    const res = frame.resolution;
    const subSize = cellSize / res;

    for (let r = 0; r < res; r++) {
      for (let c = 0; c < res; c++) {
        const value = frame.cells[r]?.[c] ?? 0;
        doc.setFillColor(value === 1 ? 0 : 255, value === 1 ? 0 : 255, value === 1 ? 0 : 255);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.25);
        doc.rect(x + c * subSize, y + r * subSize, subSize, subSize, 'FD');
      }
    }

    // Outer frame border
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.rect(x, y, cellSize, cellSize, 'S');

    // Frame number
    if (showFrameNumbers) {
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      const label = String(absoluteIndex + 1);
      const textWidth = doc.getTextWidth(label);
      doc.text(label, x + (cellSize - textWidth) / 2, y + cellSize + 8);
    }

    // Group separator line after this frame
    if (
      showSeparators &&
      (absoluteIndex + 1) % groupingSize === 0 &&
      col < framesPerRow - 1 &&
      i < frames.length - 1
    ) {
      const sepX = x + cellSize + separatorGap / 2;
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(1);
      doc.line(sepX, y, sepX, y + cellSize);
    }
  });

  doc.save(filename);
}
