import { useCallback } from 'react';
import { useFlickerStore } from '../store';
import FrameGrid from './FrameGrid';
import EditingPanel from './EditingPanel';
import './StructureView.css';

export default function StructureView() {
  const {
    groupingSize,
    setGroupingSize,
    selection,
    setSelection,
    currentFrameIndex,
    setCurrentFrameIndex,
    invertFrame,
  } = useFlickerStore();

  const handleSelectRange = useCallback((start: number, end: number) => {
    setSelection({ start: Math.min(start, end), end: Math.max(start, end) });
  }, [setSelection]);

  const handleClearSelection = () => {
    setSelection(null);
  };

  const handleFrameDoubleClick = useCallback((frameIndex: number) => {
    invertFrame(frameIndex);
  }, [invertFrame]);

  return (
    <div className="structure-view">
      <div className="structure-content">
        <div className="frame-grid-container">
          <div className="grid-controls">
            <div className="grouping-controls">
              <label>Frame Grouping:</label>
              <select 
                value={groupingSize} 
                onChange={(e) => setGroupingSize(parseInt(e.target.value) as 4 | 8 | 16 | 32)}
              >
                <option value={4}>Every 4 frames</option>
                <option value={8}>Every 8 frames</option>
                <option value={16}>Every 16 frames</option>
                <option value={32}>Every 32 frames</option>
              </select>
            </div>
            {selection && (
              <div className="selection-info">
                Frames {selection.start + 1} - {selection.end + 1} selected
                <button className="clear-selection-btn" onClick={handleClearSelection}>
                  Clear
                </button>
              </div>
            )}
          </div>

          <FrameGrid
            groupingSize={groupingSize}
            onSelectRange={handleSelectRange}
            selection={selection}
            currentFrameIndex={currentFrameIndex}
            onFrameClick={setCurrentFrameIndex}
            onFrameDoubleClick={handleFrameDoubleClick}
          />
        </div>

        <EditingPanel 
          frameIndex={currentFrameIndex}
        />
      </div>
    </div>
  );
}
