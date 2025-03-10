export type CellState = {
  value: number
  revealed: boolean
  isMine: boolean
  componentId: number
}

// Helper function to generate random colors
export const generateRandomColor = (id: number) => {
  // Use HSL to ensure good color distribution and visibility
  const hue = (id * 137.5) % 360 // Golden angle approximation
  return `hsl(${hue}, 70%, 35%)`
}

// Generate a solved grid
export const generateSolvedGrid = (size: number): CellState[][] => {
  // Set a maximum time limit for grid generation (3 seconds)
  const startTime = Date.now();
  const MAX_GENERATION_TIME = 3000; // 3 seconds in milliseconds

  // Create a fallback grid in case generation takes too long
  const createFallbackGrid = (): CellState[][] => {
    const fallbackGrid: CellState[][] = Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({
            value: 0,
            revealed: false,
            isMine: false,
            componentId: -1,
          })),
      );

    // Create simple components (one per row)
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        fallbackGrid[row][col].componentId = row;
        fallbackGrid[row][col].value = col + 1;
      }

      // Set the highest value in each row as a mine
      fallbackGrid[row][size - 1].isMine = true;
    }

    return fallbackGrid;
  };

  // Create an empty grid
  const newGrid: CellState[][] = Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => ({
          value: 0,
          revealed: false,
          isMine: false,
          componentId: -1,
        })),
    )

  // Fill the grid with random values
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      newGrid[row][col].value = Math.floor(Math.random() * size) + 1
    }
  }

  // Create connected components
  let componentId = 0
  const unassignedCells = new Set<string>()

  // Initialize all cells as unassigned
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      unassignedCells.add(`${row},${col}`)
    }
  }

  // Add a maximum retry counter to prevent infinite loops
  let maxRetries = size * size * 2; // Reasonable upper bound based on grid size

  // Continue creating components until all cells are assigned
  while (unassignedCells.size > 0 && maxRetries > 0) {
    // Check if we've exceeded the time limit
    if (Date.now() - startTime > MAX_GENERATION_TIME * 0.7) { // Use 70% of the time limit for component creation
      console.warn("Component creation taking too long, using remaining cells as a single component");

      // Assign all remaining cells to a new component
      if (unassignedCells.size > 0) {
        const remainingCells = Array.from(unassignedCells).map(cellStr => {
          const [row, col] = cellStr.split(",").map(Number) as [number, number];
          return [row, col];
        });

        for (const [row, col] of remainingCells) {
          newGrid[row][col].componentId = componentId;
          unassignedCells.delete(`${row},${col}`);
        }

        // Assign values to this component
        const availableValues = Array.from({ length: size }, (_, i) => i + 1);
        const shuffledValues = [...availableValues].sort(() => Math.random() - 0.5);

        remainingCells.forEach(([row, col], index) => {
          if (index < shuffledValues.length) {
            newGrid[row][col].value = shuffledValues[index];
          } else {
            newGrid[row][col].value = shuffledValues[index % shuffledValues.length];
          }
        });

        componentId++;
      }

      break;
    }

    // Start a new component
    const component: Array<[number, number]> = [];

    // Get all available unassigned cells
    const availableStarts = Array.from(unassignedCells);
    if (availableStarts.length === 0) break;

    // Randomly select a starting point
    const startIdx = Math.floor(Math.random() * availableStarts.length);
    const startCellStr = availableStarts[startIdx];
    const [startRow, startCol] = startCellStr.split(",").map(Number) as [number, number];

    // Use BFS to grow a connected component
    const queue: Array<[number, number]> = [[startRow, startCol]];
    const visited = new Set<string>([startCellStr]);

    while (queue.length > 0 && component.length < size) {
      const [row, col] = queue.shift()!;

      // Add this cell to the component
      component.push([row, col]);
      unassignedCells.delete(`${row},${col}`);

      // Find valid adjacent cells (4-connected neighbors)
      const adjacentCells: Array<[number, number]> = [];
      const directions: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]];

      for (const [dr, dc] of directions) {
        const r = row + dr;
        const c = col + dc;
        const cellKey = `${r},${c}`;

        if (r >= 0 && r < size && c >= 0 && c < size &&
          unassignedCells.has(cellKey) && !visited.has(cellKey)) {
          adjacentCells.push([r, c]);
          visited.add(cellKey);
        }
      }

      // Shuffle adjacent cells for randomness
      adjacentCells.sort(() => Math.random() - 0.5);

      // Add valid neighbors to the queue
      for (const cell of adjacentCells) {
        if (component.length < size) {
          queue.push(cell);
        }
      }
    }

    // If we couldn't create a component of the right size, try again with a different start
    if (component.length < size && unassignedCells.size >= size - component.length) {
      // Put the cells back into unassigned
      for (const [row, col] of component) {
        unassignedCells.add(`${row},${col}`);
      }
      // Decrement retry counter
      maxRetries--;
      continue;
    }

    // If we're at the end and have fewer cells than needed for a full component
    if (component.length < size && unassignedCells.size === 0) {
      // Find the largest existing component to merge with
      let largestComponentId = -1;
      let largestComponentSize = 0;

      // Use a Map to track component sizes more efficiently
      const componentSizes = new Map<number, number>();

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const id = newGrid[r][c].componentId;
          if (id >= 0) {
            componentSizes.set(id, (componentSizes.get(id) || 0) + 1);
          }
        }
      }

      // Find the largest component
      for (const [id, compSize] of componentSizes.entries()) {
        if (compSize > largestComponentSize) {
          largestComponentSize = compSize;
          largestComponentId = id;
        }
      }

      // Merge with the largest component
      if (largestComponentId >= 0) {
        for (const [row, col] of component) {
          newGrid[row][col].componentId = largestComponentId;
        }
      }
    } else {
      // Assign component ID to all cells in the component
      for (const [row, col] of component) {
        newGrid[row][col].componentId = componentId;
      }

      // Ensure each component has exactly size distinct values (1 to size)
      const availableValues = Array.from({ length: size }, (_, i) => i + 1);
      const shuffledValues = [...availableValues].sort(() => Math.random() - 0.5);

      // Assign unique values to each cell in the component
      component.forEach(([row, col], index) => {
        if (index < shuffledValues.length) {
          newGrid[row][col].value = shuffledValues[index];
        } else {
          // In case component is smaller than size
          newGrid[row][col].value = shuffledValues[index % shuffledValues.length];
        }
      });

      // Successfully created a component
      componentId++;
    }
  }

  // If we've exhausted retries but still have unassigned cells, assign them to the nearest component
  if (unassignedCells.size > 0) {
    const remainingCells = Array.from(unassignedCells).map(cellStr => {
      const [row, col] = cellStr.split(",").map(Number) as [number, number];
      return [row, col];
    });

    for (const [row, col] of remainingCells) {
      // Find a neighboring cell that has a component assigned
      const directions: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      let assigned = false;

      for (const [dr, dc] of directions) {
        const r = row + dr;
        const c = col + dc;

        if (r >= 0 && r < size && c >= 0 && c < size &&
          newGrid[r][c].componentId >= 0) {
          // Assign this cell to the same component as its neighbor
          newGrid[row][col].componentId = newGrid[r][c].componentId;
          unassignedCells.delete(`${row},${col}`);
          assigned = true;
          break;
        }
      }

      // If no neighbors have components, assign to component 0 as fallback
      if (!assigned && componentId > 0) {
        newGrid[row][col].componentId = 0;
        unassignedCells.delete(`${row},${col}`);
      }
    }
  }

  // Ensure each row and column has n distinct values
  const validateAndFixGrid = () => {
    // Check if we're running out of time
    if (Date.now() - startTime > MAX_GENERATION_TIME * 0.9) { // Use 90% of the time limit
      console.warn("Skipping validation to avoid timeout");
      return;
    }

    // Pre-compute component cells mapping to avoid repeated iterations
    const componentCellsMap = new Map<number, Array<[number, number]>>();

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const componentId = newGrid[r][c].componentId;
        if (!componentCellsMap.has(componentId)) {
          componentCellsMap.set(componentId, []);
        }
        componentCellsMap.get(componentId)!.push([r, c]);
      }
    }

    // Check and fix rows
    for (let row = 0; row < size; row++) {
      const rowValues = new Set<number>()
      for (let col = 0; col < size; col++) {
        rowValues.add(newGrid[row][col].value)
      }

      if (rowValues.size < size) {
        // Row has duplicates, fix it
        const missingValues = Array.from({ length: size }, (_, i) => i + 1)
          .filter(val => !rowValues.has(val))

        // Find cells with duplicate values and replace them
        const valueCounts = new Map<number, number[]>()
        for (let col = 0; col < size; col++) {
          const val = newGrid[row][col].value
          if (!valueCounts.has(val)) {
            valueCounts.set(val, [])
          }
          valueCounts.get(val)!.push(col)
        }

        // Replace duplicates with missing values
        let missingIdx = 0
        for (const cols of Array.from(valueCounts.values())) {
          if (cols.length > 1) {
            // Keep the first occurrence, replace others
            for (let i = 1; i < cols.length && missingIdx < missingValues.length; i++) {
              // Only replace if it doesn't break component uniqueness
              const componentId = newGrid[row][cols[i]].componentId
              const componentCells = componentCellsMap.get(componentId) || [];

              // Check if the missing value is already in this component
              const valueExistsInComponent = componentCells.some(
                ([r, c]) => newGrid[r][c].value === missingValues[missingIdx]
              )

              if (!valueExistsInComponent) {
                newGrid[row][cols[i]].value = missingValues[missingIdx++]
              }
            }
          }
        }
      }
    }

    // Check and fix columns
    for (let col = 0; col < size; col++) {
      const colValues = new Set<number>()
      for (let row = 0; row < size; row++) {
        colValues.add(newGrid[row][col].value)
      }

      if (colValues.size < size) {
        // Column has duplicates, fix it
        const missingValues = Array.from({ length: size }, (_, i) => i + 1)
          .filter(val => !colValues.has(val))

        // Find cells with duplicate values and replace them
        const valueCounts = new Map<number, number[]>()
        for (let row = 0; row < size; row++) {
          const val = newGrid[row][col].value
          if (!valueCounts.has(val)) {
            valueCounts.set(val, [])
          }
          valueCounts.get(val)!.push(row)
        }

        // Replace duplicates with missing values
        let missingIdx = 0
        for (const rows of Array.from(valueCounts.values())) {
          if (rows.length > 1) {
            // Keep the first occurrence, replace others
            for (let i = 1; i < rows.length && missingIdx < missingValues.length; i++) {
              // Only replace if it doesn't break component uniqueness
              const componentId = newGrid[rows[i]][col].componentId
              const componentCells = componentCellsMap.get(componentId) || [];

              // Check if the missing value is already in this component
              const valueExistsInComponent = componentCells.some(
                ([r, c]) => newGrid[r][c].value === missingValues[missingIdx]
              )

              if (!valueExistsInComponent) {
                newGrid[rows[i]][col].value = missingValues[missingIdx++]
              }
            }
          }
        }
      }
    }
  }

  // Apply validation and fixes
  validateAndFixGrid()

  // Check if we've exceeded the time limit
  if (Date.now() - startTime > MAX_GENERATION_TIME) {
    console.warn("Grid generation took too long, using fallback grid");
    return createFallbackGrid();
  }

  // Set mines for completed components
  for (let id = 0; id < componentId; id++) {
    let maxValue = -1
    let mineRow = -1
    let mineCol = -1

    // Find highest value in this component
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (newGrid[row][col].componentId === id && newGrid[row][col].value > maxValue) {
          maxValue = newGrid[row][col].value
          mineRow = row
          mineCol = col
        }
      }
    }

    if (mineRow !== -1 && mineCol !== -1) {
      newGrid[mineRow][mineCol].isMine = true
    }
  }

  return newGrid
}

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
}

// Validate and normalize grid size
export const validateGridSize = (inputSize: string): {
  size: number;
  message: string;
} => {
  const size = Number.parseInt(inputSize) || 5;

  if (size < 4) {
    return { size: 4, message: "Minimum grid size is 4x4" };
  } else if (size > 10) {
    return { size: 10, message: "Maximum grid size is 10x10" };
  }

  return { size, message: "" };
} 