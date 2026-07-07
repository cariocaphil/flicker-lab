import { useCallback } from 'react';
import { useFlickerStore } from '../store';
import { Resolution } from '../types';
import FrameEditor from './FrameEditor';
import './EditingPanel.css';

interface EditingPanelProps {
  frameIndex: number;
}

export default function EditingPanel({ frameIndex }: EditingPanelProps) {
  const {
    sequence,
    setFrameResolution,
    duplicateSelection,
    reverseSelection,
    randomizeSelection,
    clearSelection,
    selection,
  } = useFlickerStore();

  const frame = sequence[frameIndex];
  const resolutions: Resolution[] = [1, 2, 4, 8];

  const handleRandomize = useCallback(() => {
    const densityStr = prompt('Black density (%)', '50');
    if (densityStr) {
      const density = Math.max(0, Math.min(100, parseInt(densityStr) || 50));
      randomizeSelection(density);
    }
  }, [randomizeSelection]);

  return (
    <div className="editing-panel">
      <div className="editing-panel-header">
        <h3>Frame {frameIndex + 1}</h3>
      </div>

      <div className="editing-panel-content">
        <FrameEditor frame={frame} frameIndex={frameIndex} />

        <div className="frame-settings">
          <div className="setting-group">
            <label>Sub-frame Resolution:</label>
            <div className="resolution-buttons">
              {resolutions.map((res) => (
                <button
                  key={res}
                  className={`resolution-btn ${frame.resolution === res ? 'active' : ''}`}
                  onClick={() => setFrameResolution(frameIndex, res)}
                >
                  {res}x{res}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selection && (
          <div className="batch-operations">
            <h4>Selection Operations</h4>
            <div className="op-buttons">
              <button className="op-btn" onClick={duplicateSelection}>
                Duplicate
              </button>
              <button className="op-btn" onClick={reverseSelection}>
                Reverse
              </button>
              <button className="op-btn" onClick={handleRandomize}>
                Randomize
              </button>
              <button className="op-btn danger" onClick={clearSelection}>
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
