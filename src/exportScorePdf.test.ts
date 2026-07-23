import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Frame } from './types';

const saveMock = vi.fn();
const textMock = vi.fn();
const rectMock = vi.fn();
const lineMock = vi.fn();
const setFontSizeMock = vi.fn();
const setTextColorMock = vi.fn();
const setFillColorMock = vi.fn();
const setDrawColorMock = vi.fn();
const setLineWidthMock = vi.fn();
const getTextWidthMock = vi.fn(() => 4);

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function MockJsPDF(this: Record<string, unknown>) {
    this.save = saveMock;
    this.text = textMock;
    this.rect = rectMock;
    this.line = lineMock;
    this.setFontSize = setFontSizeMock;
    this.setTextColor = setTextColorMock;
    this.setFillColor = setFillColorMock;
    this.setDrawColor = setDrawColorMock;
    this.setLineWidth = setLineWidthMock;
    this.getTextWidth = getTextWidthMock;
    return this;
  }),
}));

import { jsPDF } from 'jspdf';
import { exportScorePdf } from './exportScorePdf';

const frame = (
  cells: number[][],
  resolution = cells.length as 1 | 2 | 4 | 8
): Frame => ({
  resolution,
  cells: cells as Frame['cells'],
});

describe('exportScorePdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTextWidthMock.mockReturnValue(4);
  });

  it('does nothing for an empty sequence', async () => {
    exportScorePdf([]);
    expect(jsPDF).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('creates a PDF and saves with the given filename', () => {
    const sequence = [
      frame([[0]]),
      frame([[1]]),
      frame(
        [
          [1, 0],
          [0, 1],
        ],
        2
      ),
    ];

    exportScorePdf(sequence, { filename: 'score-test.pdf' });

    expect(jsPDF).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith('score-test.pdf');
    expect(textMock).toHaveBeenCalledWith(
      'Flicker Lab — Score',
      expect.any(Number),
      expect.any(Number)
    );
    expect(textMock).toHaveBeenCalledWith(
      'Frames 1–3',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('exports only the selected range', () => {
    const sequence = [frame([[0]]), frame([[1]]), frame([[0]]), frame([[1]])];

    exportScorePdf(sequence, {
      selectedRange: { start: 1, end: 2 },
      filename: 'range.pdf',
    });

    expect(textMock).toHaveBeenCalledWith(
      'Frames 2–3',
      expect.any(Number),
      expect.any(Number)
    );
    expect(saveMock).toHaveBeenCalledWith('range.pdf');
  });

  it('draws sub-cells for higher-resolution frames', () => {
    const sequence = [
      frame(
        [
          [1, 0],
          [0, 1],
        ],
        2
      ),
    ];

    exportScorePdf(sequence, {
      showFrameNumbers: false,
      showSeparators: false,
      framesPerRow: 8,
      cellSize: 16,
    });

    // 4 sub-cells (FD) + 1 outer border (S)
    expect(rectMock).toHaveBeenCalled();
    const fillDrawCalls = rectMock.mock.calls.filter(
      (call) => call[4] === 'FD'
    );
    expect(fillDrawCalls).toHaveLength(4);
  });

  it('skips frame numbers when disabled', () => {
    exportScorePdf([frame([[1]])], {
      showFrameNumbers: false,
      filename: 'no-numbers.pdf',
    });

    const numberLabels = textMock.mock.calls.filter((call) => call[0] === '1');
    expect(numberLabels).toHaveLength(0);
  });
});
