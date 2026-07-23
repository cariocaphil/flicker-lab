import { useCallback } from 'react';
import { Frame } from '../types';
import './FrameCell.css';

interface FrameCellProps {
  frame: Frame;
  frameIndex: number;
  isSelected: boolean;
  isCurrent: boolean;
  onMouseDown: (index: number) => void;
  onMouseEnter: (index: number) => void;
  onDoubleClick?: (index: number) => void;
}

export default function FrameCell({
  frame,
  frameIndex,
  isSelected,
  isCurrent,
  onMouseDown,
  onMouseEnter,
  onDoubleClick,
}: FrameCellProps) {
  const handleClick = useCallback(() => {
    onMouseDown(frameIndex);
  }, [frameIndex, onMouseDown]);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter(frameIndex);
  }, [frameIndex, onMouseEnter]);

  const handleDoubleClick = useCallback(() => {
    if (onDoubleClick) {
      onDoubleClick(frameIndex);
    }
  }, [frameIndex, onDoubleClick]);

  return (
    <div
      className={`frame-cell ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
      onMouseDown={handleClick}
      onMouseEnter={handleMouseEnter}
      onDoubleClick={handleDoubleClick}
      title={`Frame ${frameIndex + 1}`}
    >
      <div className="frame-preview">
        {frame.resolution === 1 ? (
          <div
            className={`frame-content single-cell ${frame.cells[0][0] === 1 ? 'black' : 'white'}`}
          />
        ) : (
          <div className="frame-grid-preview">
            {frame.cells.map((row, rowIdx) => (
              <div key={rowIdx} className="frame-row">
                {row.map((cell, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`frame-grid-cell ${cell === 1 ? 'black' : 'white'}`}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="frame-number">{frameIndex + 1}</div>
    </div>
  );
}
