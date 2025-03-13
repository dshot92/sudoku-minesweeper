// Define the cell state interface
export interface TutorialCellState {
  value: number;
  revealed: boolean;
  isMine: boolean;
  componentId: number;
}

// Create a valid 4x4 Sudoku Minesweeper grid
const createBaseTutorialGrid = (): TutorialCellState[][] => {
  return [
    [
      { value: 3, revealed: true, isMine: false, componentId: 0 },
      { value: 4, revealed: true, isMine: true, componentId: 0 },
      { value: 2, revealed: true, isMine: false, componentId: 1 },
      { value: 1, revealed: true, isMine: false, componentId: 1 },
    ],
    [
      { value: 4, revealed: true, isMine: true, componentId: 2 },
      { value: 1, revealed: true, isMine: false, componentId: 0 },
      { value: 3, revealed: true, isMine: false, componentId: 3 },
      { value: 2, revealed: true, isMine: false, componentId: 1 },
    ],
    [
      { value: 1, revealed: true, isMine: false, componentId: 2 },
      { value: 2, revealed: true, isMine: false, componentId: 3 },
      { value: 4, revealed: true, isMine: true, componentId: 3 },
      { value: 3, revealed: true, isMine: false, componentId: 1 },
    ],
    [
      { value: 2, revealed: true, isMine: false, componentId: 2 },
      { value: 3, revealed: true, isMine: false, componentId: 2 },
      { value: 1, revealed: true, isMine: false, componentId: 3 },
      { value: 4, revealed: true, isMine: true, componentId: 1 },
    ],
  ];
};

// Generate grid for the "numbers" step - reveal some numbers
export const generateNumbersGrid = (): TutorialCellState[][] => {
  const grid = createBaseTutorialGrid();
  // Reveal all cells
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      grid[r][c].revealed = true;
    }
  }
  return grid;
};

// Generate grid for the "mines" step - reveal all mines
export const generateMinesGrid = (): TutorialCellState[][] => {
  const grid = createBaseTutorialGrid();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c].isMine) {
        grid[r][c].revealed = true;
      }
    }
  }
  return grid;
};

// Generate grid for the "region completion" step - reveal region 0
export const generateRegionCompletionGrid = (): TutorialCellState[][] => {
  const grid = createBaseTutorialGrid();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c].componentId === 0) {
        grid[r][c].revealed = true;
      }
    }
  }
  return grid;
};

// Generate grid for "winning the game" - empty grid for user to try to reveal all
export const generateWinningGrid = (): TutorialCellState[][] => {
  return createBaseTutorialGrid();
}; 