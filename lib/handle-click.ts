import { CellState } from './types';

/**
 * Check if all non-mine cells in a component are revealed and reveal the mine if so
 * @param grid The game grid
 * @returns Updated grid with mines revealed in completed components
 */
export const revealMinesInCompletedComponents = (grid: CellState[][]): CellState[][] => {
  const size = grid.length;
  const newGrid = [...grid.map(row => [...row])];

  // Get all unique component IDs
  const componentIds = new Set<number>();
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      componentIds.add(newGrid[row][col].componentId);
    }
  }

  // Check each component
  componentIds.forEach(componentId => {
    let allNonMinesRevealed = true;
    let minePosition: { row: number, col: number } | null = null;

    // Find all cells in this component
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const cell = newGrid[row][col];
        if (cell.componentId === componentId) {
          if (cell.isMine) {
            minePosition = { row, col };
          } else if (!cell.revealed) {
            allNonMinesRevealed = false;
          }
        }
      }
    }

    // If all non-mine cells are revealed, reveal the mine too
    if (allNonMinesRevealed && minePosition) {
      newGrid[minePosition.row][minePosition.col].revealed = true;
      newGrid[minePosition.row][minePosition.col].isFlag = true;
    }
  });

  return newGrid;
};

/**
 * Check if the game is in a won state
 * @param grid The game grid
 * @returns True if all non-mine cells and all mines are revealed
 */
export const isGameWon = (grid: CellState[][]): boolean => {
  const size = grid.length;

  // Check if all non-mine cells are revealed
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = grid[row][col];
      if (!cell.isMine && !cell.revealed) {
        return false;
      }
    }
  }

  // Check if all mines are revealed
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = grid[row][col];
      if (cell.isMine && !cell.revealed) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Check if all non-mine cells in rows and columns are revealed and flag the mine if so
 * @param grid The game grid
 * @returns Updated grid with mines flagged in completed rows and columns
 */
export const flagMinesInCompletedRowsAndColumns = (grid: CellState[][]): CellState[][] => {
  const size = grid.length;
  const newGrid = [...grid.map(row => [...row])];

  // Check each row
  for (let row = 0; row < size; row++) {
    let allNonMinesRevealed = true;
    let minePosition: { row: number, col: number } | null = null;

    // Find all cells in this row
    for (let col = 0; col < size; col++) {
      const cell = newGrid[row][col];
      if (cell.isMine) {
        minePosition = { row, col };
      } else if (!cell.revealed) {
        allNonMinesRevealed = false;
        break;
      }
    }

    // If all non-mine cells are revealed, flag the mine
    if (allNonMinesRevealed && minePosition) {
      newGrid[minePosition.row][minePosition.col].revealed = true;
      newGrid[minePosition.row][minePosition.col].isFlag = true;
    }
  }

  // Check each column
  for (let col = 0; col < size; col++) {
    let allNonMinesRevealed = true;
    let minePosition: { row: number, col: number } | null = null;

    // Find all cells in this column
    for (let row = 0; row < size; row++) {
      const cell = newGrid[row][col];
      if (cell.isMine) {
        minePosition = { row, col };
      } else if (!cell.revealed) {
        allNonMinesRevealed = false;
        break;
      }
    }

    // If all non-mine cells are revealed, flag the mine
    if (allNonMinesRevealed && minePosition) {
      newGrid[minePosition.row][minePosition.col].revealed = true;
      newGrid[minePosition.row][minePosition.col].isFlag = true;
    }
  }

  return newGrid;
};

/**
 * Reveals the last remaining unrevealed non-mine cell in the grid if there's only one left
 * @param grid The game grid
 * @returns Updated grid with the last cell revealed if applicable
 */
export const revealLastRemainingCell = (grid: CellState[][]): CellState[][] => {
  const size = grid.length;
  const newGrid = [...grid.map(row => [...row])];
  
  let unrevealed = 0;
  let lastCell: { row: number, col: number } | null = null;
  
  // Count unrevealed non-mine cells and remember the last one
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = newGrid[row][col];
      if (!cell.revealed && !cell.isMine) {
        unrevealed++;
        lastCell = { row, col };
        
        // If we've found more than one, we can exit early
        if (unrevealed > 1) {
          return newGrid;
        }
      }
    }
  }
  
  // If there's exactly one unrevealed non-mine cell, reveal it
  if (unrevealed === 1 && lastCell) {
    newGrid[lastCell.row][lastCell.col].revealed = true;
  }
  
  return newGrid;
};

/**
 * Check if all mines are flagged
 * @param grid The game grid
 * @returns True if all mines are flagged
 */
export const areAllMinesFlagged = (grid: CellState[][]): boolean => {
  const size = grid.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = grid[row][col];
      // If there's a mine that's not flagged, return false
      if (cell.isMine && !cell.isFlag) {
        return false;
      }
    }
  }
  
  // All mines are flagged
  return true;
};

/**
 * Reveal all remaining cells in the grid (for when game is won by flagging all mines)
 * @param grid The game grid
 * @returns Updated grid with all cells revealed
 */
export const revealAllCells = (grid: CellState[][]): CellState[][] => {
  const size = grid.length;
  const newGrid = [...grid.map(row => [...row])];
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      newGrid[row][col].revealed = true;
    }
  }
  
  return newGrid;
};

// Handle cell click and return updated grid and game state
export const handleCellClick = (
  grid: CellState[][],
  row: number,
  col: number,
  gridSize: number
): {
  newGrid: CellState[][];
  gameOver: boolean;
  gameWon: boolean;
  message: string;
} => {
  if (grid[row][col].revealed) {
    return { newGrid: grid, gameOver: false, gameWon: false, message: "" };
  }

  const newGrid = [...grid.map((r) => [...r])];
  const cell = newGrid[row][col];

  // Reveal the cell
  cell.revealed = true;

  // Check if it's a mine
  if (cell.isMine) {
    // Make sure this mine is not marked as a flag since it was clicked directly
    cell.isFlag = false;

    // Reveal all cells when game is lost
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        newGrid[r][c].revealed = true;
      }
    }

    return {
      newGrid,
      gameOver: true,
      gameWon: false,
      message: "Game Over"
    };
  }

  // Check for completed components and reveal their mines
  let updatedGrid = revealMinesInCompletedComponents(newGrid);
  
  // Also check for completed rows and columns and flag their mines
  updatedGrid = flagMinesInCompletedRowsAndColumns(updatedGrid);
  
  // Check if there's only one unrevealed non-mine cell and reveal it
  updatedGrid = revealLastRemainingCell(updatedGrid);
  
  // Check if all mines are now flagged
  if (areAllMinesFlagged(updatedGrid)) {
    // Reveal all cells
    updatedGrid = revealAllCells(updatedGrid);
    
    return {
      newGrid: updatedGrid,
      gameOver: false,
      gameWon: true,
      message: "You won!"
    };
  }

  // Check if the game is won through regular win condition
  if (isGameWon(updatedGrid)) {
    return {
      newGrid: updatedGrid,
      gameOver: false,
      gameWon: true,
      message: "You won!"
    };
  }

  return { newGrid: updatedGrid, gameOver: false, gameWon: false, message: "" };
}; 