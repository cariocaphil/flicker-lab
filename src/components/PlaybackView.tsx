import { useEffect, useRef, useState, useCallback } from 'react';
import { useFlickerStore } from '../store';
import CanvasPlayer from './CanvasPlayer';
import './PlaybackView.css';

export default function PlaybackView() {
  const {
    sequence,
    fps,
    isPlaying,
    setIsPlaying,
    isLooping,
    setIsLooping,
    currentFrameIndex,
    setCurrentFrameIndex,
  } = useFlickerStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    setDuration((sequence.length * 1000) / fps);
  }, [sequence.length, fps]);

  const drawFrame = useCallback(
    (frameIndex: number) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const frame = sequence[frameIndex];
      const cellSize = canvasRef.current.width / frame.resolution;

      // Clear canvas
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Draw cells
      for (let row = 0; row < frame.resolution; row++) {
        for (let col = 0; col < frame.resolution; col++) {
          if (frame.cells[row][col] === 1) {
            ctx.fillStyle = '#000';
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          }
        }
      }
    },
    [sequence]
  );

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (now: number) => {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = now;
      }

      const elapsed = now - lastFrameTimeRef.current;
      let newTime = currentTime + elapsed;

      if (newTime >= duration) {
        if (isLooping) {
          newTime = 0;
          setCurrentTime(0);
          setCurrentFrameIndex(0);
          lastFrameTimeRef.current = now;
        } else {
          setIsPlaying(false);
          newTime = duration;
          lastFrameTimeRef.current = 0;
        }
      } else {
        setCurrentTime(newTime);
        const frameIdx = Math.floor((newTime / 1000) * fps) % sequence.length;
        setCurrentFrameIndex(frameIdx);
      }

      drawFrame(currentFrameIndex);
      animationRef.current = requestAnimationFrame(animate);
      lastFrameTimeRef.current = now;
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    isPlaying,
    currentTime,
    duration,
    fps,
    isLooping,
    sequence.length,
    setCurrentFrameIndex,
    drawFrame,
    currentFrameIndex,
    setIsPlaying,
  ]);

  useEffect(() => {
    drawFrame(currentFrameIndex);
  }, [currentFrameIndex, drawFrame]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    lastFrameTimeRef.current = 0;
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    const frameIdx = Math.floor((newTime / 1000) * fps) % sequence.length;
    setCurrentFrameIndex(frameIdx);
    drawFrame(frameIdx);
  };

  return (
    <div className="playback-view">
      <div className="player-container">
        <canvas
          ref={canvasRef}
          className="player-canvas"
          width={400}
          height={400}
        />
        <CanvasPlayer
          isPlaying={isPlaying}
          isLooping={isLooping}
          onPlayPause={handlePlayPause}
          onToggleLoop={() => setIsLooping(!isLooping)}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          fps={fps}
          currentFrame={currentFrameIndex + 1}
          totalFrames={sequence.length}
        />
      </div>
    </div>
  );
}
