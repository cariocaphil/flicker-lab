import { useFlickerStore } from '../store';
import { FPS } from '../types';
import { exportScorePdf } from '../exportScorePdf';
import './Toolbar.css';

export default function Toolbar() {
  const {
    currentView,
    setCurrentView,
    fps,
    setFPS,
    saveProject,
    sequence,
    selection,
    groupingSize,
  } = useFlickerStore();

  const fpsOptions: FPS[] = [12, 24, 48];

  const handleExportScore = () => {
    exportScorePdf(sequence, {
      groupingSize,
      selectedRange: selection ?? undefined,
      filename: `flicker-score-${Date.now()}.pdf`,
    });
  };

  const handleSaveProject = () => {
    const name = prompt('Project name:', 'flicker-film');
    if (name) {
      saveProject(name);
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h1 className="app-title">Flicker Lab</h1>
      </div>

      <div className="toolbar-section">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${currentView === 'structure' ? 'active' : ''}`}
            onClick={() => setCurrentView('structure')}
          >
            Structure
          </button>
          <button
            className={`toggle-btn ${currentView === 'playback' ? 'active' : ''}`}
            onClick={() => setCurrentView('playback')}
          >
            Playback
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        {currentView === 'playback' && (
          <div className="fps-control">
            <label htmlFor="fps-select">FPS:</label>
            <select
              id="fps-select"
              value={fps}
              onChange={(e) => setFPS(parseInt(e.target.value) as FPS)}
            >
              {fpsOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="toolbar-section">
        <button className="tool-btn" onClick={handleExportScore}>
          PDF Export
        </button>
        <button className="tool-btn" onClick={handleSaveProject}>
          Save Project
        </button>
      </div>
    </div>
  );
}
