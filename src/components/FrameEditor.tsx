import { useCallback } from 'react';
import { useFlickerStore } from '../store';
import { Frame } from '../types';
import './FrameEditor.css';

interface FrameEditorProps {
  frame: Frame;
  frameIndex: number;
}

export default function FrameEditor({ frame, frameIndex }: FrameEditorProps) {
  const { paintCells, eraseCells } = useFlickerStore();

  const handleCellClick = useCallback(
    (row: number, col: number, isShiftKey: boolean) => {
      if (isShiftKey) {
        eraseCells(frameIndex, [{ row, col }]);
      } else {
        paintCells(frameIndex, [{ row, col }]);
      }
    },
    [frameIndex, paintCells, eraseCells]
  );

  const res = frame.resolution;

  return (
    <div className="frame-editor">
      <div className="editor-grid">
        {frame.cells.map((row, rowIdx) => (
          <div key={rowIdx} className="editor-row">
            {row.map((cell, colIdx) => (
              <button
                key={`${rowIdx}-${colIdx}`}
                className={`editor-cell ${cell === 1 ? 'black' : 'white'}`}
                onClick={(e) => handleCellClick(rowIdx, colIdx, e.shiftKey)}
                title={`Click to paint, Shift+Click to erase`}
                style={{
                  width: `calc(100% / ${res})`,
                  aspectRatio: '1',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
