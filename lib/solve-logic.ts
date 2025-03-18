import { CellState } from './types';
import { fisherYatesShuffle, getAllCoordinates, shuffle, cloneDeep } from './grid-generator';

/**
 * Check if the grid has a unique solution
 * @param grid The numeric grid to check
 * @param componentGrid The component grid for constraints
 * @returns True if the grid has a unique solution, false otherwise
 */
export const hasUniqueSolution = (grid: number[][], componentGrid: number[][]): boolean => {
  const size = grid.length;
  let solutions = 0;

  // Fast fail for empty grid
  if (grid.every(row => row.every(cell => cell === 0))) {
    return false;
  }

  const quickSolve = (clone: number[][]): boolean => {
    const emptyCells: [number, number][] = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (clone[row][col] === 0) {
          emptyCells.push([row, col]);
        }
      }
    }

    for (const [row, col] of emptyCells) {
      const used = new Set<number>();

      // Row constraints
      for (let c = 0; c < size; c++) {
        if (clone[row][c] !== 0) used.add(clone[row][c]);
      }

      // Column constraints
      for (let r = 0; r < size; r++) {
        if (clone[r][col] !== 0) used.add(clone[r][col]);
      }

      // Component constraints
      const componentId = componentGrid[row][col];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (componentGrid[r][c] === componentId && clone[r][c] !== 0) {
            used.add(clone[r][c]);
          }
        }
      }

      if (used.size === size - 1) {
        const value = Array.from({ length: size }, (_, i) => i + 1)
          .find(v => !used.has(v))!;
        clone[row][col] = value;
      }
    }
    return true;
  };

  // Helper function to check if a value is valid at a position
  const isValid = (row: number, col: number, value: number, clone: number[][]): boolean => {
    // Check row
    for (let c = 0; c < size; c++) {
      if (c !== col && clone[row][c] === value) return false;
    }

    // Check column
    for (let r = 0; r < size; r++) {
      if (r !== row && clone[r][col] === value) return false;
    }

    // Check component
    const currentComponent = componentGrid[row][col];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (componentGrid[r][c] === currentComponent && clone[r][c] === value) {
          return false;
        }
      }
    }

    return true;
  };

  // Main check with optimizations
  const countSolutions = (row: number, col: number, clone: number[][]): number => {
    if (row === size) return 1;
    if (solutions > 1) return solutions;

    const nextCol = (col + 1) % size;
    const nextRow = nextCol === 0 ? row + 1 : row;

    if (clone[row][col] !== 0) {
      return countSolutions(nextRow, nextCol, clone);
    }

    let total = 0;
    const values = fisherYatesShuffle(Array.from({ length: size }, (_, i) => i + 1));

    for (const value of values) {
      if (isValid(row, col, value, clone)) {
        clone[row][col] = value;
        total += countSolutions(nextRow, nextCol, clone);
        clone[row][col] = 0;
        if (total > 1) break;
      }
    }

    return total;
  };

  // First try quick deduction
  const clone = grid.map(row => [...row]);
  if (!quickSolve(clone)) return false;

  // Then count solutions
  solutions = countSolutions(0, 0, clone);
  return solutions === 1;
};

/**
 * Generate a puzzle with minimal clues while maintaining a unique solution
 * @param filledGrid The complete filled grid
 * @param componentGrid The component grid for constraints
 * @returns A puzzle with minimal clues
 */
export const generatePuzzle = (filledGrid: number[][], componentGrid: number[][]): number[][] => {
  const puzzle = cloneDeep(filledGrid);
  const cells = shuffle(getAllCoordinates(puzzle.length));

  for (const [row, col] of cells) {
    const original = puzzle[row][col];
    puzzle[row][col] = 0;

    if (!hasUniqueSolution(puzzle, componentGrid)) {
      puzzle[row][col] = original; // Restore if uniqueness broken
    }
  }

  return puzzle;
};

/**
 * Determine the minimum set of cells that need to be revealed for the puzzle to have a unique solution
 * @param grid The game grid
 * @param componentGrid The component grid
 * @param maxCells Maximum number of cells to reveal (optional, defaults to size)
 * @returns Array of cell coordinates to reveal
 */
export const findMinimumRevealedCells = (
  grid: CellState[][],
  componentGrid: number[][],
  maxCells?: number
): { row: number, col: number }[] => {
  const size = grid.length;
  // Default maxCells to the grid size if not specified
  const maxRevealedCells = maxCells || size;

  // Get all non-mine cells
  const nonMineCells = getAllCoordinates(size)
    .filter(([row, col]) => !grid[row][col].isMine);

  // Shuffle to randomize the selection
  const shuffledCells = shuffle(nonMineCells);

  // Create a numeric grid for testing uniqueness
  const numericGrid: number[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));

  const minimumRevealedCells: { row: number, col: number }[] = [];

  // First pass: add cells until we have a unique solution
  for (const [row, col] of shuffledCells) {
    // If we've already reached our maximum, stop
    if (minimumRevealedCells.length >= maxRevealedCells) break;

    // Try adding this cell
    numericGrid[row][col] = grid[row][col].value;
    minimumRevealedCells.push({ row, col });

    // Check if we have a unique solution
    if (hasUniqueSolution(numericGrid, componentGrid)) {
      break; // We found a set that gives a unique solution
    }
  }

  // If we didn't find a unique solution, return what we have
  if (!hasUniqueSolution(numericGrid, componentGrid)) {
    return minimumRevealedCells;
  }

  // Second pass: try to remove cells while maintaining uniqueness
  // Start from the end to prioritize keeping earlier cells
  for (let i = minimumRevealedCells.length - 1; i >= 0; i--) {
    const { row, col } = minimumRevealedCells[i];
    const originalValue = numericGrid[row][col];

    // Try removing this cell
    numericGrid[row][col] = 0;

    // If solution is still unique, we can remove this cell
    if (hasUniqueSolution(numericGrid, componentGrid)) {
      minimumRevealedCells.splice(i, 1);
    } else {
      // Otherwise, restore it
      numericGrid[row][col] = originalValue;
    }
  }

  return minimumRevealedCells;
};

/**
 * Generate a hint for the player
 * @param grid The game grid
 * @returns Coordinates of a hidden non-mine cell to reveal, or null if none exist
 */
export const generateHint = (grid: CellState[][]): { row: number, col: number } | null => {
  const size = grid.length;
  const hiddenNonMineCells: { row: number, col: number }[] = [];

  // Find all hidden non-mine cells
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = grid[row][col];
      if (!cell.revealed && !cell.isMine) {
        hiddenNonMineCells.push({ row, col });
      }
    }
  }

  // If no hidden non-mine cells, return null
  if (hiddenNonMineCells.length === 0) {
    return null;
  }

  // Randomly select a hidden non-mine cell
  const randomIndex = Math.floor(Math.random() * hiddenNonMineCells.length);
  return hiddenNonMineCells[randomIndex];
};

/**
 * Calculate the difficulty level based on the number of revealed cells
 * @param grid The game grid
 * @returns Difficulty level as a string: 'easy', 'medium', 'hard', or 'expert'
 */
export const calculateDifficulty = (grid: CellState[][]): string => {
  const size = grid.length;
  const totalCells = size * size;
  const mineCount = size; // One mine per component
  const nonMineCells = totalCells - mineCount;

  // Count revealed non-mine cells
  let revealedNonMineCells = 0;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = grid[row][col];
      if (cell.revealed && !cell.isMine) {
        revealedNonMineCells++;
      }
    }
  }

  // Calculate percentage of revealed non-mine cells
  const revealedPercentage = (revealedNonMineCells / nonMineCells) * 100;

  // Determine difficulty based on percentage
  if (revealedPercentage >= 50) {
    return 'easy';
  } else if (revealedPercentage >= 30) {
    return 'medium';
  } else if (revealedPercentage >= 15) {
    return 'hard';
  } else {
    return 'expert';
  }
}; 