import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Frame } from './types';
import { useFlickerStore } from './store';

const blankFrame = (): Frame => ({
  resolution: 1,
  cells: [[0]],
});

const blankSequence = (length = 16): Frame[] =>
  Array.from({ length }, () => blankFrame());

describe('useFlickerStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useFlickerStore.setState({
      sequence: blankSequence(16),
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

  it('toggles a cell between white and black', () => {
    const { toggleCell } = useFlickerStore.getState();
    expect(useFlickerStore.getState().sequence[0].cells[0][0]).toBe(0);

    toggleCell(0, 0, 0);
    expect(useFlickerStore.getState().sequence[0].cells[0][0]).toBe(1);

    toggleCell(0, 0, 0);
    expect(useFlickerStore.getState().sequence[0].cells[0][0]).toBe(0);
  });

  it('paints and erases cells', () => {
    useFlickerStore.getState().setFrameResolution(0, 2);
    useFlickerStore.getState().paintCells(0, [
      { row: 0, col: 0 },
      { row: 1, col: 1 },
    ]);

    const painted = useFlickerStore.getState().sequence[0].cells;
    expect(painted[0][0]).toBe(1);
    expect(painted[1][1]).toBe(1);
    expect(painted[0][1]).toBe(0);

    useFlickerStore.getState().eraseCells(0, [{ row: 0, col: 0 }]);
    expect(useFlickerStore.getState().sequence[0].cells[0][0]).toBe(0);
    expect(useFlickerStore.getState().sequence[0].cells[1][1]).toBe(1);
  });

  it('resizes frame resolution and preserves overlapping cells', () => {
    useFlickerStore.getState().toggleCell(0, 0, 0);
    useFlickerStore.getState().setFrameResolution(0, 2);

    const frame = useFlickerStore.getState().sequence[0];
    expect(frame.resolution).toBe(2);
    expect(frame.cells).toHaveLength(2);
    expect(frame.cells[0][0]).toBe(1);
    expect(frame.cells[0][1]).toBe(0);
  });

  it('inverts all cells in a frame', () => {
    useFlickerStore.getState().setFrameResolution(0, 2);
    useFlickerStore.getState().paintCells(0, [{ row: 0, col: 0 }]);
    useFlickerStore.getState().invertFrame(0);

    const cells = useFlickerStore.getState().sequence[0].cells;
    expect(cells[0][0]).toBe(0);
    expect(cells[0][1]).toBe(1);
    expect(cells[1][0]).toBe(1);
    expect(cells[1][1]).toBe(1);
  });

  it('duplicates, reverses, and clears a selection', () => {
    useFlickerStore.getState().toggleCell(0, 0, 0);
    useFlickerStore.getState().toggleCell(1, 0, 0);
    useFlickerStore.setState({ selection: { start: 0, end: 1 } });

    useFlickerStore.getState().duplicateSelection();
    expect(useFlickerStore.getState().sequence[2].cells[0][0]).toBe(1);
    expect(useFlickerStore.getState().sequence[3].cells[0][0]).toBe(1);

    useFlickerStore.getState().reverseSelection();
    expect(useFlickerStore.getState().sequence[0].cells[0][0]).toBe(1);
    expect(useFlickerStore.getState().sequence[1].cells[0][0]).toBe(1);

    // After reverse of [black, black] still black; set distinct pattern then reverse
    useFlickerStore.getState().eraseCells(1, [{ row: 0, col: 0 }]);
    useFlickerStore.getState().reverseSelection();
    expect(useFlickerStore.getState().sequence[0].cells[0][0]).toBe(0);
    expect(useFlickerStore.getState().sequence[1].cells[0][0]).toBe(1);

    useFlickerStore.getState().clearSelection();
    expect(useFlickerStore.getState().sequence[0].cells[0][0]).toBe(0);
    expect(useFlickerStore.getState().sequence[1].cells[0][0]).toBe(0);
  });

  it('randomizes selection at given density', () => {
    useFlickerStore.setState({ selection: { start: 0, end: 3 } });
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);

    useFlickerStore.getState().randomizeSelection(50);

    for (let i = 0; i <= 3; i++) {
      expect(useFlickerStore.getState().sequence[i].cells[0][0]).toBe(1);
    }

    randomSpy.mockReturnValue(0.9);
    useFlickerStore.getState().randomizeSelection(50);
    for (let i = 0; i <= 3; i++) {
      expect(useFlickerStore.getState().sequence[i].cells[0][0]).toBe(0);
    }

    randomSpy.mockRestore();
  });

  it('persists sequence to localStorage on edits', () => {
    useFlickerStore.getState().toggleCell(0, 0, 0);
    const saved = localStorage.getItem('flickerlab-project');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved!);
    expect(parsed[0].cells[0][0]).toBe(1);
  });

  it('saves and loads a project file payload', () => {
    useFlickerStore.getState().toggleCell(2, 0, 0);

    const clickSpy = vi.fn();
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tag: string) => {
        if (tag === 'a') {
          return {
            href: '',
            download: '',
            click: clickSpy,
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      }) as typeof document.createElement);

    const createObjectURL = vi.fn(() => 'blob:mock');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });

    useFlickerStore.getState().saveProject('test-film');
    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();

    const blobArg = createObjectURL.mock.calls[0]?.[0];
    expect(blobArg).toBeInstanceOf(Blob);
    expect((blobArg as Blob).type).toBe('application/json');

    createElementSpy.mockRestore();
    vi.unstubAllGlobals();

    useFlickerStore.getState().loadProject(
      JSON.stringify({
        sequence: [
          { resolution: 1, cells: [[1]] },
          { resolution: 1, cells: [[0]] },
        ],
      })
    );
    expect(useFlickerStore.getState().sequence).toHaveLength(2);
    expect(useFlickerStore.getState().sequence[0].cells[0][0]).toBe(1);
  });

  it('ignores invalid project JSON on load', () => {
    const before = useFlickerStore.getState().sequence;
    useFlickerStore.getState().loadProject('not-json');
    expect(useFlickerStore.getState().sequence).toEqual(before);
  });
});
