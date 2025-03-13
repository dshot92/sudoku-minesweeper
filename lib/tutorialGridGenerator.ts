// Define the cell state interface
export interface TutorialCellState {
  value: number;
  revealed: boolean;
  isMine: boolean;
  componentId: number;
  isHighlighted?: boolean;
}

// Create a valid 4x4 tutorial grid with predefined values for better teaching
function createBaseTutorialGrid(): TutorialCellState[][] {
  // Use a predefined valid grid that clearly demonstrates the concepts
  const values = [
    [2, 4, 1, 3],
    [3, 1, 4, 2],
    [1, 2, 3, 4],
    [4, 3, 2, 1]
  ];

  const componentIds = [
    [0, 0, 1, 1],
    [0, 0, 1, 1],
    [2, 2, 3, 3],
    [2, 2, 3, 3]
  ];

  return values.map((row, rowIndex) =>
    row.map((value, colIndex) => ({
      value,
      revealed: false,
      isMine: value === 4, // In a 4x4 grid, 4 is always a mine
      componentId: componentIds[rowIndex][colIndex],
      isHighlighted: false
    }))
  );
}

// Generate grid for the "numbers" step - reveal strategic numbers
export const generateNumbersGrid = (): TutorialCellState[][] => {
  const grid = createBaseTutorialGrid();

  // Reveal numbers in a pattern that demonstrates row/column uniqueness
  // Reveal two numbers in first row and their corresponding column numbers
  grid[0][0].revealed = true; // Show 2
  grid[0][2].revealed = true; // Show 1
  grid[1][0].revealed = true; // Show 3
  grid[2][2].revealed = true; // Show 3

  // Highlight the revealed cells to show the pattern
  grid[0][0].isHighlighted = true;
  grid[0][2].isHighlighted = true;
  grid[1][0].isHighlighted = true;
  grid[2][2].isHighlighted = true;

  return grid;
};

// Generate grid for the "mines" step - strategically reveal mines
export const generateMinesGrid = (): TutorialCellState[][] => {
  const grid = createBaseTutorialGrid();

  // Reveal one complete region to show how mines work
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      grid[r][c].revealed = true;
      if (grid[r][c].isMine) {
        grid[r][c].isHighlighted = true;
      }
    }
  }

  // Also reveal one mine in another region to reinforce the pattern
  grid[2][3].revealed = true;
  grid[2][3].isHighlighted = true;

  return grid;
};

// Generate grid for the "region completion" step
export const generateRegionCompletionGrid = (): TutorialCellState[][] => {
  const grid = createBaseTutorialGrid();

  // Focus on the top-right region (componentId 1)
  for (let r = 0; r < 2; r++) {
    for (let c = 2; c < 4; c++) {
      if (!grid[r][c].isMine) {
        grid[r][c].revealed = true;
      }
      grid[r][c].isHighlighted = true;
    }
  }

  return grid;
};

// Generate grid for "winning the game" - partially revealed grid
export const generateWinningGrid = (): TutorialCellState[][] => {
  const grid = createBaseTutorialGrid();

  // Reveal most cells except for a few strategic ones
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      // Leave one non-mine cell and its corresponding mine unrevealed in one region
      if (!(r === 0 && c === 2) && !(r === 0 && c === 3)) {
        grid[r][c].revealed = true;
      }
    }
  }

  return grid;
};