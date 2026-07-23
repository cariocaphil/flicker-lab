import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Toolbar from './Toolbar';
import { useFlickerStore } from '../store';
import { Frame } from '../types';

vi.mock('../exportScorePdf', () => ({
  exportScorePdf: vi.fn(),
}));

import { exportScorePdf } from '../exportScorePdf';

const blankFrame = (): Frame => ({
  resolution: 1,
  cells: [[0]],
});

describe('Toolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useFlickerStore.setState({
      sequence: Array.from({ length: 8 }, () => blankFrame()),
      currentView: 'structure',
      currentFrameIndex: 0,
      currentSubFrameIndex: null,
      groupingSize: 8,
      fps: 12,
      isPlaying: false,
      isLooping: false,
      selection: null,
    });
  });

  it('renders the PDF Export button', () => {
    render(<Toolbar />);
    expect(screen.getByRole('button', { name: 'PDF Export' })).toBeInTheDocument();
  });

  it('exports the full sequence as PDF when clicked', async () => {
    const user = userEvent.setup();
    render(<Toolbar />);

    await user.click(screen.getByRole('button', { name: 'PDF Export' }));

    expect(exportScorePdf).toHaveBeenCalledTimes(1);
    const [sequence, options] = vi.mocked(exportScorePdf).mock.calls[0];
    expect(sequence).toHaveLength(8);
    expect(options).toMatchObject({
      groupingSize: 8,
      selectedRange: undefined,
    });
    expect(options?.filename).toMatch(/^flicker-score-\d+\.pdf$/);
  });

  it('passes the current selection to PDF export', async () => {
    useFlickerStore.setState({ selection: { start: 2, end: 5 } });
    const user = userEvent.setup();
    render(<Toolbar />);

    await user.click(screen.getByRole('button', { name: 'PDF Export' }));

    expect(exportScorePdf).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        selectedRange: { start: 2, end: 5 },
        groupingSize: 8,
      })
    );
  });

  it('toggles between structure and playback views', async () => {
    const user = userEvent.setup();
    render(<Toolbar />);

    await user.click(screen.getByRole('button', { name: 'Playback' }));
    expect(useFlickerStore.getState().currentView).toBe('playback');
    expect(screen.getByLabelText('FPS:')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Structure' }));
    expect(useFlickerStore.getState().currentView).toBe('structure');
    expect(screen.queryByLabelText('FPS:')).not.toBeInTheDocument();
  });
});
