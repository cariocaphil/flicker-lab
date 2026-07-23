import './CanvasPlayer.css';

interface CanvasPlayerProps {
  isPlaying: boolean;
  isLooping: boolean;
  onPlayPause: () => void;
  onToggleLoop: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  fps: number;
  currentFrame: number;
  totalFrames: number;
}

export default function CanvasPlayer({
  isPlaying,
  isLooping,
  onPlayPause,
  onToggleLoop,
  currentTime,
  duration,
  onSeek,
  fps,
  currentFrame,
  totalFrames,
}: CanvasPlayerProps) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  return (
    <div className="canvas-player">
      <div className="player-controls">
        <button
          className="control-btn"
          onClick={onPlayPause}
          title="Play/Pause"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className={`control-btn loop-btn ${isLooping ? 'active' : ''}`}
          onClick={onToggleLoop}
          title="Loop"
        >
          🔁
        </button>
      </div>

      <div className="progress-container">
        <span className="time-label">{formatTime(currentTime)}</span>
        <input
          type="range"
          className="progress-slider"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSliderChange}
        />
        <span className="time-label">{formatTime(duration)}</span>
      </div>

      <div className="info-display">
        <div className="info-item">
          Frame: {currentFrame} / {totalFrames}
        </div>
        <div className="info-item">FPS: {fps}</div>
      </div>
    </div>
  );
}
