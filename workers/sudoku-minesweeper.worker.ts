import { generateSolvedGrid, CellState, generatePuzzle } from '@/lib/sudoku-minesweeper';

export type WorkerMessageData = {
  type: 'generateGrid';
  size: number;
} | {
  type: 'generatePuzzle';
  filledGrid: number[][];
  componentGrid: number[][];
}

onmessage = (event: MessageEvent<WorkerMessageData>) => {
  try {
    if (event.data.type === 'generateGrid') {
      const { size } = event.data;
      const grid = generateSolvedGrid(size);
      const componentGrid = grid.map((row: CellState[]) => row.map((cell: CellState) => cell.componentId))
      postMessage({ grid, componentGrid });
    } else if (event.data.type === 'generatePuzzle') {
      const { filledGrid, componentGrid } = event.data;
      const puzzle = generatePuzzle(filledGrid, componentGrid);
      postMessage({ puzzle });
    }

  } catch (error: any) {
    postMessage({ error: error.message });
  }
};