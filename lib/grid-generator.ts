import { CellState } from './types';
import { revealMinesInCompletedComponents, isGameWon, findMinimumRevealedCells } from './solve-logic';

/**
 * Generate a Latin square (n×n grid where each row and column contains n distinct values)
 * that also ensures each component has distinct values
 */
const generateLatinSquare = (
  size: number,
  componentGrid: number[][]
): number[][] | null => {
  // Initialize grid with zeros
  const grid: number[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));

  // Helper function to check if a value is valid at a position
  const isValid = (row: number, col: number, value: number): boolean => {
    // Check row
    for (let c = 0; c < size; c++) {
      if (c !== col && grid[row][c] === value) return false;
    }

    // Check column
    for (let r = 0; r < size; r++) {
      if (r !== row && grid[r][col] === value) return false;
    }

    // Check component
    const currentComponent = componentGrid[row][col];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (componentGrid[r][c] === currentComponent && grid[r][c] === value) {
          return false;
        }
      }
    }

    return true;
  };

  // Helper function for efficient shuffling
  const fisherYatesShuffle = (array: number[]): number[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Revised fillGrid implementation
  const fillGrid = (): boolean => {
    const size = grid.length;
    const stack: { row: number; col: number; values: number[] }[] = [];
    let currentRow = 0;
    let currentCol = 0;

    while (currentRow < size && currentCol < size) {
      if (grid[currentRow][currentCol] === 0) {
        const values = fisherYatesShuffle(Array.from({ length: size }, (_, i) => i + 1));
        let foundValid = false;

        for (const value of values) {
          if (isValid(currentRow, currentCol, value)) {
            grid[currentRow][currentCol] = value;
            stack.push({ row: currentRow, col: currentCol, values });
            foundValid = true;
            break;
          }
        }

        if (!foundValid) {
          // Backtrack
          while (stack.length > 0) {
            const last = stack.pop()!;
            grid[last.row][last.col] = 0;
            if (last.values.length > 0) {
              const nextValue = last.values.pop()!;
              if (isValid(last.row, last.col, nextValue)) {
                grid[last.row][last.col] = nextValue;
                stack.push(last);
                currentRow = last.row;
                currentCol = last.col;
                break;
              }
            }
          }
          if (stack.length === 0) return false;
        }
      }

      // Move to next cell
      currentCol++;
      if (currentCol === size) {
        currentRow++;
        currentCol = 0;
      }
    }

    return true;
  };

  // Try to fill the grid
  return fillGrid() ? grid : null;
};

/**
 * Create connected components using floodfill
 */
export const createConnectedComponents = (
  size: number
): { componentGrid: number[][], componentSizes: Map<number, number> } => {
  // Initialize component grid with -1 (unassigned)
  const componentGrid: number[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(-1));

  // Track component sizes
  const componentSizes = new Map<number, number>();

  // Keep trying until we get exactly n components of size n
  let attempts = 0;
  const maxAttempts = 1000; // Increase max attempts since we have stricter constraints

  while (attempts < maxAttempts) {
    // Reset the grid and sizes
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        componentGrid[row][col] = -1;
      }
    }
    componentSizes.clear();

    // Create a list of all cells
    const unassignedCells: [number, number][] = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        unassignedCells.push([row, col]);
      }
    }

    // Shuffle cells for randomness
    unassignedCells.sort(() => Math.random() - 0.5);

    // Try to create exactly n components
    let success = true;
    const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let componentId = 0; componentId < size; componentId++) {
      // Find a starting cell for this component
      let startCell: [number, number] | undefined;
      for (let i = 0; i < unassignedCells.length; i++) {
        const [row, col] = unassignedCells[i];
        if (componentGrid[row][col] === -1) {
          startCell = [row, col];
          break;
        }
      }

      if (!startCell) {
        success = false;
        break;
      }

      // Use BFS to grow the component
      const component: [number, number][] = [];
      const queue: [number, number][] = [startCell];
      const visited = new Set<string>([`${startCell[0]},${startCell[1]}`]);

      while (queue.length > 0 && component.length < size) {
        const [row, col] = queue.shift()!;

        // Add this cell to the component if it's unassigned
        if (componentGrid[row][col] === -1) {
          component.push([row, col]);
          componentGrid[row][col] = componentId;
        }

        // If we have enough cells, stop growing
        if (component.length === size) break;

        // Find valid adjacent cells
        const adjacentCells: [number, number][] = [];
        for (const [dr, dc] of directions) {
          const r = row + dr;
          const c = col + dc;
          const cellKey = `${r},${c}`;

          if (
            r >= 0 && r < size &&
            c >= 0 && c < size &&
            componentGrid[r][c] === -1 &&
            !visited.has(cellKey)
          ) {
            adjacentCells.push([r, c]);
            visited.add(cellKey);
          }
        }

        // Shuffle and add valid neighbors to the queue
        adjacentCells.sort(() => Math.random() - 0.5);
        queue.push(...adjacentCells);
      }

      // If we couldn't create a component of size n, mark this attempt as failed
      if (component.length !== size) {
        success = false;
        break;
      }

      // Store the component size
      componentSizes.set(componentId, size);

      // Remove used cells from unassignedCells
      for (const [row, col] of component) {
        const index = unassignedCells.findIndex(([r, c]) => r === row && c === col);
        if (index !== -1) {
          unassignedCells.splice(index, 1);
        }
      }
    }

    // If we successfully created n components of size n, verify they're all connected
    if (success && componentSizes.size === size) {
      // Verify all components are connected
      const isConnected = (componentId: number): boolean => {
        const cells: [number, number][] = [];
        for (let row = 0; row < size; row++) {
          for (let col = 0; col < size; col++) {
            if (componentGrid[row][col] === componentId) {
              cells.push([row, col]);
            }
          }
        }

        if (cells.length === 0) return false;

        // Use BFS to check connectivity
        const visited = new Set<string>();
        const queue: [number, number][] = [cells[0]];
        visited.add(`${cells[0][0]},${cells[0][1]}`);

        while (queue.length > 0) {
          const [row, col] = queue.shift()!;
          for (const [dr, dc] of directions) {
            const r = row + dr;
            const c = col + dc;
            const key = `${r},${c}`;
            if (
              r >= 0 && r < size &&
              c >= 0 && c < size &&
              componentGrid[r][c] === componentId &&
              !visited.has(key)
            ) {
              queue.push([r, c]);
              visited.add(key);
            }
          }
        }

        return visited.size === size;
      };

      // Check if all components are connected
      let allConnected = true;
      for (let i = 0; i < size; i++) {
        if (!isConnected(i)) {
          allConnected = false;
          break;
        }
      }

      if (allConnected) {
        return { componentGrid, componentSizes };
      }
    }

    attempts++;
  }

  throw new Error(`Failed to create ${size} components of size ${size} after ${maxAttempts} attempts`);
};

// Generate a solved grid
export const generateSolvedGrid = (
  size: number,
  maxInitialRevealed?: number
): CellState[][] => {
  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    try {
      // Step 1: Create connected components
      const { componentGrid } = createConnectedComponents(size);

      // Step 2: Generate a Latin square that respects component constraints
      const latinSquare = generateLatinSquare(size, componentGrid);

      if (!latinSquare) {
        attempts++;
        continue;
      }

      // Verify row and column sums
      const expectedSum = (size * (size + 1)) / 2;
      let validSums = true;

      // Check row sums
      for (let row = 0; row < size; row++) {
        const sum = latinSquare[row].reduce((a, b) => a + b, 0);
        if (sum !== expectedSum) {
          validSums = false;
          break;
        }
      }

      // Check column sums
      if (validSums) {
        for (let col = 0; col < size; col++) {
          let sum = 0;
          for (let row = 0; row < size; row++) {
            sum += latinSquare[row][col];
          }
          if (sum !== expectedSum) {
            validSums = false;
            break;
          }
        }
      }

      if (!validSums) {
        attempts++;
        continue;
      }

      // Step 3: Convert to CellState grid
      const newGrid: CellState[][] = Array(size)
        .fill(null)
        .map((_, row) =>
          Array(size)
            .fill(null)
            .map((_, col) => ({
              value: latinSquare[row][col],
              revealed: false,
              isMine: false,
              isFlag: false,
              componentId: componentGrid[row][col],
            }))
        );

      // Step 4: Set mines (highest value in each component)
      const componentHighestValues = new Map<number, { value: number; row: number; col: number }>();

      // Find highest value in each component
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          const componentId = componentGrid[row][col];
          const value = latinSquare[row][col];

          if (
            !componentHighestValues.has(componentId) ||
            value > componentHighestValues.get(componentId)!.value
          ) {
            componentHighestValues.set(componentId, { value, row, col });
          }
        }
      }

      // Set mines
      for (const { row, col } of componentHighestValues.values()) {
        newGrid[row][col].isMine = true;
      }

      // Step 5: Find minimum cells to reveal for a unique solution
      const cellsToReveal = findMinimumRevealedCells(newGrid, componentGrid, maxInitialRevealed);

      // Set these cells as revealed by default
      for (const { row, col } of cellsToReveal) {
        newGrid[row][col].revealed = true;
      }

      // Step 6: Check if any components are completed and reveal their mines
      const finalGrid = revealMinesInCompletedComponents(newGrid);

      // Step 7: Ensure the game isn't already won
      if (isGameWon(finalGrid)) {
        // If the game is already won, try again with fewer revealed cells
        if (maxInitialRevealed && maxInitialRevealed > size / 2) {
          return generateSolvedGrid(size, Math.floor(maxInitialRevealed * 0.8));
        }
        attempts++;
        continue;
      }

      return finalGrid;
    } catch {
      attempts++;
    }
  }

  throw new Error(`Failed to generate a valid grid after ${maxAttempts} attempts`);
};

/**
 * Generate a grid with a specific difficulty level
 * @param size The size of the grid
 * @param difficulty The desired difficulty: 'easy', 'medium', 'hard', or 'expert'
 * @returns A grid with the specified difficulty
 */
export const generateGridWithDifficulty = (
  size: number,
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
): CellState[][] => {
  // Use dynamic difficulty thresholds from the utility function
  const thresholds = getDifficultyThresholds(size);
  const percentage = thresholds[difficulty];
  
  const totalNonMineCells = size * size - size; // Total cells minus mines
  const maxCellsToReveal = Math.ceil(totalNonMineCells * percentage);

  // Generate grid with the calculated maximum number of revealed cells
  return generateSolvedGrid(size, maxCellsToReveal);
};

// Utility functions
export const fisherYatesShuffle = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const cloneDeep = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
export const shuffle = <T>(array: T[]): T[] => fisherYatesShuffle([...array]);
export const getAllCoordinates = (size: number): [number, number][] =>
  Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => [row, col] as [number, number])
  ).flat();

/**
 * Get difficulty thresholds adjusted for grid size
 * @param size The size of the grid
 * @returns Object containing thresholds for each difficulty level
 */
export const getDifficultyThresholds = (size: number): {
  easy: number;
  medium: number;
  hard: number;
  expert: number;
} => {
  // Adjust based on grid size - larger grids are harder with same percentage
  const sizeAdjustmentFactor = Math.log2(size) / Math.log2(4); // Normalized to size 4
  
  return {
    easy: 0.45 - (0.05 * (sizeAdjustmentFactor - 1)),
    medium: 0.25 - (0.05 * (sizeAdjustmentFactor - 1)),
    hard: 0.12 - (0.03 * (sizeAdjustmentFactor - 1)),
    expert: 0.05 - (0.01 * (sizeAdjustmentFactor - 1))
  };
};

export { generateLatinSquare };

/**
 * Generates a puzzle grid following a step-by-step approach:
 * 1. Creates connected components
 * 2. Generates a Latin grid
 * 3. Sets the minimum required revealed cells
 * @param size The size of the grid (n×n)
 * @param maxInitialRevealed Optional maximum number of initially revealed cells
 * @returns A ready-to-play puzzle grid
 */
export const generateCustomGrid = (size: number, maxInitialRevealed?: number): CellState[][] => {
  // Step 1: Create connected components
  const { componentGrid } = createConnectedComponents(size);
  
  // Step 2: Generate a Latin square that respects component constraints
  const latinSquare = generateLatinSquare(size, componentGrid);
  
  if (!latinSquare) {
    throw new Error('Failed to generate a valid Latin square');
  }
  
  // Step 3: Convert to CellState grid
  const newGrid: CellState[][] = Array(size)
    .fill(null)
    .map((_, row) =>
      Array(size)
        .fill(null)
        .map((_, col) => ({
          value: latinSquare[row][col],
          revealed: false,
          isMine: false,
          isFlag: false,
          componentId: componentGrid[row][col],
        }))
    );
  
  // Step 4: Set mines (highest value in each component)
  const componentHighestValues = new Map<number, { value: number; row: number; col: number }>();
  
  // Find highest value in each component
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const componentId = componentGrid[row][col];
      const value = latinSquare[row][col];
      
      if (
        !componentHighestValues.has(componentId) ||
        value > componentHighestValues.get(componentId)!.value
      ) {
        componentHighestValues.set(componentId, { value, row, col });
      }
    }
  }
  
  // Set mines
  for (const { row, col } of componentHighestValues.values()) {
    newGrid[row][col].isMine = true;
  }
  
  // Step 5: Find minimum cells to reveal for a unique solution
  const cellsToReveal = findMinimumRevealedCells(newGrid, componentGrid, maxInitialRevealed);
  
  // Set these cells as revealed by default
  for (const { row, col } of cellsToReveal) {
    newGrid[row][col].revealed = true;
  }
  
  return newGrid;
} 