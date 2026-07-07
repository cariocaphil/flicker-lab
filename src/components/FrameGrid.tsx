import { useCallback, useRef, useState } from 'react';
import { useFlickerStore } from '../store';
import { GroupingSize } from '../types';
import FrameCell from './FrameCell';
import './FrameGrid.css';

interface FrameGridProps {
  groupingSize: GroupingSize;
  selection: { start: number; end: number } | null;
  currentFrameIndex: number;
  onSelectRange: (start: number, end: number) => void;
  onFrameClick: (index: number) => void;
  onFrameDoubleClick: (index: number) => void;
}

export default function FrameGrid({
  groupingSize,
  selection,
  currentFrameIndex,
  onSelectRange,
  onFrameClick,
  onFrameDoubleClick,
}: FrameGridProps) {
  const { sequence } = useFlickerStore();
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionStartRef = useRef<number | null>(null);

  const handleMouseDown = useCallback((index: number) => {
    setIsSelecting(true);
    selectionStartRef.current = index;
    onFrameClick(index);
  }, [onFrameClick]);

  const handleMouseEnter = useCallback((index: number) => {
    if (isSelecting && selectionStartRef.current !== null) {
      onSelectRange(selectionStartRef.current, index);
    }
  }, [isSelecting, onSelectRange]);

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  return (
    <div
      className="frame-grid"
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      <div className="frames-container">
        {sequence.map((frame, index) => {
          const showSeparator = (index + 1) % groupingSize === 0;
          const isSelected = selection ? index >= selection.start && index <= selection.end : false;
          const isCurrent = index === currentFrameIndex;

          return (
            <div
              key={index}
              className={`frame-wrapper ${showSeparator ? 'separator-after' : ''}`}
            >
              <FrameCell
                frame={frame}
                frameIndex={index}
                isSelected={isSelected}
                isCurrent={isCurrent}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onDoubleClick={onFrameDoubleClick}
              />
              {showSeparator && <div className="frame-separator" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
