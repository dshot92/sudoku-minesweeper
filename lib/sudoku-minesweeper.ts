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

  // Recursive function to fill the grid
  const fillGrid = (row: number, col: number): boolean => {
    if (col === size) {
      return fillGrid(row + 1, 0);
    }
    if (row === size) {
      return true;
    }

    // Create array of values 1 to n and shuffle it
    const values = Array.from({ length: size }, (_, i) => i + 1)
      .sort(() => Math.random() - 0.5);

    for (const value of values) {
      if (isValid(row, col, value)) {
        grid[row][col] = value;
        if (fillGrid(row, col + 1)) {
          return true;
        }
        grid[row][col] = 0; // backtrack
      }
    }

    return false;
  };

  // Try to fill the grid
  return fillGrid(0, 0) ? grid : null;
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

// Generate a solved grid
export const generateSolvedGrid = (size: number): CellState[][] => {
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

      return newGrid;
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
  if (grid[row][col].revealed) {
    return { newGrid: grid, gameOver: false, gameWon: false, message: "" };
  }

  const newGrid = [...grid.map((r) => [...r])];
  const cell = newGrid[row][col];

  // Reveal the cell
  cell.revealed = true;

  // Check if it's a mine
  if (cell.isMine) {
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
      message: "Game Over! You clicked on a mine."
    };
  } else {
    // Check if all non-mine cells in this component are revealed
    const componentId = cell.componentId;
    let allNonMinesInComponentRevealed = true;
    let minePosition: { row: number, col: number } | null = null;

    // Find all cells in this component
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (newGrid[r][c].componentId === componentId) {
          if (newGrid[r][c].isMine) {
            minePosition = { row: r, col: c };
          } else if (!newGrid[r][c].revealed) {
            allNonMinesInComponentRevealed = false;
          }
        }
      }
    }

    // If all non-mine cells in the component are revealed, reveal the mine too
    if (allNonMinesInComponentRevealed && minePosition) {
      newGrid[minePosition.row][minePosition.col].revealed = true;
    }

    // Check if all non-mine cells are revealed (win condition)
    let allNonMinesRevealed = true;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!newGrid[r][c].isMine && !newGrid[r][c].revealed) {
          allNonMinesRevealed = false;
          break;
        }
      }
      if (!allNonMinesRevealed) break;
    }

    if (allNonMinesRevealed) {
      return {
        newGrid,
        gameOver: false,
        gameWon: true,
        message: "Congratulations! You've won!"
      };
    }
  }

  return { newGrid, gameOver: false, gameWon: false, message: "" };
};