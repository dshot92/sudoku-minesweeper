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
  // Reveal all non-mine cells in this region except one
  for (let r = 0; r < 2; r++) {
    for (let c = 2; c < 4; c++) {
      // Leave one non-mine cell unrevealed to demonstrate auto-revelation
      if (!(r === 1 && c === 2)) {
        if (!grid[r][c].isMine) {
          grid[r][c].revealed = true;
        }
      }
      // Highlight all cells in this region
      grid[r][c].isHighlighted = true;
    }
  }

  // Reveal a few cells in other regions for context
  grid[0][0].revealed = true;
  grid[2][0].revealed = true;
  grid[3][3].revealed = true;

  return grid;
};

// Generate grid for "using rows and columns" step
export const generateRowsColumnsGrid = (): TutorialCellState[][] => {
  const grid = createBaseTutorialGrid();

  // Reveal almost a complete row to demonstrate deduction
  grid[1][0].revealed = true; // 3
  grid[1][1].revealed = true; // 1
  grid[1][3].revealed = true; // 2
  // Leave grid[1][2] (value 4) unrevealed - player should deduce it

  // Reveal almost a complete column to demonstrate column deduction
  grid[0][0].revealed = true; // 2
  grid[2][0].revealed = true; // 1
  grid[3][0].revealed = true; // 4
  // We already revealed grid[1][0] above
  
  // Highlight the relevant row and column
  for (let i = 0; i < 4; i++) {
    grid[1][i].isHighlighted = true; // Highlight the row
    grid[i][0].isHighlighted = true; // Highlight the column
  }

  // Add a few other revealed cells for context
  grid[0][3].revealed = true;
  grid[2][2].revealed = true;

  return grid;
};

// Generate grid for cross-region deduction step
export const generateCrossRegionGrid = (): TutorialCellState[][] => {
  const grid = createBaseTutorialGrid();

  // Set up a scenario where cross-region deduction is needed
  // Reveal key cells in multiple regions that force deduction

  // Region 0 (top-left)
  grid[0][0].revealed = true; // 2
  grid[1][1].revealed = true; // 1
  
  // Region 1 (top-right)  
  grid[0][2].revealed = true; // 1
  grid[0][3].revealed = true; // 3
  
  // Region 2 (bottom-left)
  grid[2][0].revealed = true; // 1
  grid[3][1].revealed = true; // 3
  
  // Region 3 (bottom-right)
  grid[2][2].revealed = true; // 3
  grid[2][3].revealed = true; // 4

  // Complete first row except one cell that requires cross-region thinking
  grid[0][1].revealed = true; // 4

  // Complete first column except one cell that requires cross-region thinking
  grid[1][0].revealed = true; // 3
  
  // Highlight cells that demonstrate cross-region deduction
  // Highlight cells where the player needs to deduce values
  grid[1][2].isHighlighted = true; // Unrevealed cell that can be deduced
  grid[1][3].isHighlighted = true; // Unrevealed cell that can be deduced
  
  // Add some context with row/column constraints
  grid[3][0].revealed = true; // 4
  grid[3][3].revealed = true; // 1

  return grid;
};

// Generate grid for mine safety demonstration
export const generateMineSafetyGrid = (): TutorialCellState[][] => {
  const grid = createBaseTutorialGrid();

  // Set up regions in different states of completion to teach mine safety

  // Region 0 (top-left): Almost complete, missing only mine
  grid[0][0].revealed = true; // 2
  grid[0][1].revealed = true; // 4 (mine) - already revealed to show it's safe
  grid[1][0].revealed = true; // 3
  grid[1][1].revealed = true; // 1

  // Region 1 (top-right): All non-mine cells revealed to auto-reveal mine
  for (let r = 0; r < 2; r++) {
    for (let c = 2; c < 4; c++) {
      if (!grid[r][c].isMine) {
        grid[r][c].revealed = true;
      }
    }
  }
  // The mine will be auto-revealed when the player explores the grid

  // Region 2 (bottom-left): Partially revealed, mine not yet discoverable
  grid[2][0].revealed = true; // 1
  grid[2][1].revealed = true; // 2
  // Leave grid[3][0] and grid[3][1] unrevealed

  // Region 3 (bottom-right): Partially revealed
  grid[2][2].revealed = true; // 3
  // Leave grid[2][3], grid[3][2] and grid[3][3] unrevealed

  // Highlight regions to focus on for this step
  for (let r = 0; r < 2; r++) {
    for (let c = 2; c < 4; c++) {
      grid[r][c].isHighlighted = true; // Highlight region 1
    }
  }
  for (let r = 2; r < 4; r++) {
    for (let c = 0; c < 2; c++) {
      grid[r][c].isHighlighted = true; // Highlight region 2
    }
  }

  return grid;
};

// Generate grid for "winning the game" - partially revealed grid
export const generateWinningGrid = (): TutorialCellState[][] => {
  const grid = createBaseTutorialGrid();

  // Reveal a strategic set of cells that makes the puzzle solvable
  // but still requires the player to apply all learned techniques
  
  // Reveal about 60% of the grid to give a good starting point
  const cellsToReveal = [
    [0, 0], [0, 2], [0, 3],
    [1, 0], [1, 1], [1, 3],
    [2, 0], [2, 2], 
    [3, 1], [3, 3]
  ];
  
  cellsToReveal.forEach(([r, c]) => {
    grid[r][c].revealed = true;
  });

  // Highlight a region where completing will reveal a mine
  for (let r = 2; r < 4; r++) {
    for (let c = 2; c < 4; c++) {
      grid[r][c].isHighlighted = true;
    }
  }

  return grid;
};