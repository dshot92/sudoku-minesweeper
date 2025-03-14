export type CellState = {
  value: number
  revealed: boolean
  isMine: boolean
  componentId: number
}

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
const createConnectedComponents = (
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
  // console.log('Cell clicked:', { row, col, cell: grid[row][col] });

  if (grid[row][col].revealed) {
    // console.log('Cell already revealed, no action');
    return { newGrid: grid, gameOver: false, gameWon: false, message: "" };
  }

  const newGrid = [...grid.map((r) => [...r])];
  const cell = newGrid[row][col];

  // Reveal the cell
  cell.revealed = true;
  // console.log('Cell revealed:', { row, col, value: cell.value, isMine: cell.isMine });

  // Check if it's a mine
  if (cell.isMine) {
    // console.log('Mine clicked! Game over.');
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
  const updatedGrid = revealMinesInCompletedComponents(newGrid);

  // Check if the game is won
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

// Add utility functions at the top
const fisherYatesShuffle = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const cloneDeep = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
const shuffle = <T>(array: T[]): T[] => fisherYatesShuffle([...array]);
const getAllCoordinates = (size: number): [number, number][] =>
  Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => [row, col] as [number, number])
  ).flat();

// Update hasUniqueSolution signature
const hasUniqueSolution = (grid: number[][], componentGrid: number[][]): boolean => {
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

  // Main check with optimizations
  const countSolutions = (row: number, col: number): number => {
    if (row === size) return 1;
    if (solutions > 1) return solutions;

    const nextCol = (col + 1) % size;
    const nextRow = nextCol === 0 ? row + 1 : row;

    if (grid[row][col] !== 0) {
      return countSolutions(nextRow, nextCol);
    }

    let total = 0;
    const values = fisherYatesShuffle(Array.from({ length: size }, (_, i) => i + 1));

    for (const value of values) {
      if (isValid(row, col, value)) {
        grid[row][col] = value;
        total += countSolutions(nextRow, nextCol);
        grid[row][col] = 0;
        if (total > 1) break;
      }
    }

    return total;
  };

  // Redefine isValid within this scope
  const isValid = (row: number, col: number, value: number): boolean => {
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

  // First try quick deduction
  const clone = grid.map(row => [...row]);
  if (!quickSolve(clone)) return false;

  // Then count solutions
  solutions = countSolutions(0, 0);
  return solutions === 1;
};

// Update generatePuzzle to pass componentGrid
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

// Add this function to the existing file
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
  // Map difficulty to maximum percentage of revealed cells
  const difficultyMap = {
    'easy': 0.5,    // 50% of non-mine cells revealed
    'medium': 0.3,  // 30% of non-mine cells revealed
    'hard': 0.15,   // 15% of non-mine cells revealed
    'expert': 0.05  // 5% of non-mine cells revealed
  };

  const percentage = difficultyMap[difficulty];
  const totalNonMineCells = size * size - size; // Total cells minus mines
  const maxCellsToReveal = Math.ceil(totalNonMineCells * percentage);

  // Generate grid with the calculated maximum number of revealed cells
  return generateSolvedGrid(size, maxCellsToReveal);
};