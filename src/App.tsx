import { useFlickerStore } from './store';
import StructureView from './components/StructureView';
import PlaybackView from './components/PlaybackView';
import Toolbar from './components/Toolbar';
import './App.css';

export default function App() {
  const { currentView } = useFlickerStore();

  return (
    <div className="app">
      <Toolbar />
      <div className="view-container">
        {currentView === 'structure' ? <StructureView /> : <PlaybackView />}
      </div>
    </div>
  );
}
