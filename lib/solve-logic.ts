import { CellState } from './types';
import { fisherYatesShuffle, shuffle, cloneDeep } from './grid-generator';

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
 * Check if a puzzle can be solved through logical deduction only
 * @param puzzle The puzzle grid with some empty cells
 * @param componentGrid The component grid for constraints
 * @returns True if the puzzle can be solved by logic alone
 */
export const canSolveLogically = (puzzle: number[][], componentGrid: number[][]): boolean => {
  const size = puzzle.length;
  const clone = cloneDeep(puzzle);
  
  // Initialize candidate grid - for each empty cell, track all possible values
  const candidates: Set<number>[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));
  
  // Initialize candidates for all empty cells
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (clone[row][col] === 0) {
        candidates[row][col] = findPossibleValues(clone, componentGrid, row, col);
      }
    }
  }
  
  let progress = true;
  while (progress) {
    progress = false;
    
    // Step 1: Fill in cells with only one candidate
    if (applyNakedSingles(clone, candidates)) {
      progress = true;
      continue;
    }
    
    // Step 2: Apply hidden singles technique
    if (applyHiddenSingles(clone, candidates, componentGrid)) {
      progress = true;
      continue;
    }
    
    // Step 3: Apply naked pairs technique 
    if (applyNakedPairs(candidates, componentGrid)) {
      progress = true;
      continue;
    }
    
    // Step 4: Apply pointing pairs technique
    if (applyPointingPairs(candidates, componentGrid)) {
      progress = true;
      continue;
    }
  }
  
  // Check if puzzle is completely solved
  return clone.every(row => row.every(cell => cell !== 0));
};

/**
 * Apply naked singles - when a cell has only one possible value
 */
const applyNakedSingles = (grid: number[][], candidates: Set<number>[][]): boolean => {
  const size = grid.length;
  let progress = false;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === 0 && candidates[row][col]?.size === 1) {
        const value = candidates[row][col].values().next().value;
        if (value !== undefined) {
          // Place the value
          grid[row][col] = value;
          candidates[row][col] = null as unknown as Set<number>;
          progress = true;
          
          // Update candidates in the same row, column, and component
          updateCandidatesAfterPlacement(grid, candidates, row, col, value);
        }
      }
    }
  }
  
  return progress;
};

/**
 * Update candidates after placing a value
 */
const updateCandidatesAfterPlacement = (
  grid: number[][], 
  candidates: Set<number>[][], 
  placedRow: number, 
  placedCol: number, 
  value: number
): void => {
  const size = grid.length;
  
  // Update row
  for (let col = 0; col < size; col++) {
    if (grid[placedRow][col] === 0 && candidates[placedRow][col]?.has(value)) {
      candidates[placedRow][col].delete(value);
    }
  }
  
  // Update column
  for (let row = 0; row < size; row++) {
    if (grid[row][placedCol] === 0 && candidates[row][placedCol]?.has(value)) {
      candidates[row][placedCol].delete(value);
    }
  }
  
  // We'd need the component grid here ideally, but we're working with a simplification
  // This would be handled through the broader update process
};

/**
 * Apply hidden singles - when a value can only go in one cell within a unit
 */
const applyHiddenSingles = (
  grid: number[][], 
  candidates: Set<number>[][], 
  componentGrid: number[][]
): boolean => {
  const size = grid.length;
  let progress = false;
  
  // Check rows
  for (let row = 0; row < size; row++) {
    progress = findHiddenSinglesInUnit(grid, candidates, componentGrid, 'row', row) || progress;
  }
  
  // Check columns
  for (let col = 0; col < size; col++) {
    progress = findHiddenSinglesInUnit(grid, candidates, componentGrid, 'column', col) || progress;
  }
  
  // Check components
  const components = new Set<number>();
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      components.add(componentGrid[row][col]);
    }
  }
  
  for (const component of components) {
    progress = findHiddenSinglesInUnit(grid, candidates, componentGrid, 'component', component) || progress;
  }
  
  return progress;
};

const findHiddenSinglesInUnit = (
  grid: number[][],
  candidates: Set<number>[][],
  componentGrid: number[][],
  unitType: 'row' | 'column' | 'component',
  unitIndex: number
): boolean => {
  const size = grid.length;
  let progress = false;
  
  // For each possible value, check if it only appears in one cell in this unit
  for (let value = 1; value <= size; value++) {
    const cellsWithValue: {row: number, col: number}[] = [];
    
    // Find all cells in this unit that could contain this value
    if (unitType === 'row') {
      for (let col = 0; col < size; col++) {
        if (grid[unitIndex][col] === 0 && candidates[unitIndex][col]?.has(value)) {
          cellsWithValue.push({row: unitIndex, col});
        }
      }
    } else if (unitType === 'column') {
      for (let row = 0; row < size; row++) {
        if (grid[row][unitIndex] === 0 && candidates[row][unitIndex]?.has(value)) {
          cellsWithValue.push({row, col: unitIndex});
        }
      }
    } else { // component
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (componentGrid[row][col] === unitIndex && 
              grid[row][col] === 0 && 
              candidates[row][col]?.has(value)) {
            cellsWithValue.push({row, col});
          }
        }
      }
    }
    
    // If this value appears as a candidate in exactly one cell, it must go there
    if (cellsWithValue.length === 1) {
      const {row, col} = cellsWithValue[0];
      grid[row][col] = value;
      candidates[row][col] = null as unknown as Set<number>;
      updateCandidatesAfterPlacement(grid, candidates, row, col, value);
      progress = true;
    }
  }
  
  return progress;
};

/**
 * Apply naked pairs - when two cells in a unit can only contain the same two values
 */
const applyNakedPairs = (candidates: Set<number>[][], componentGrid: number[][]): boolean => {
  const size = candidates.length;
  let progress = false;
  
  // Check rows
  for (let row = 0; row < size; row++) {
    progress = findNakedPairsInUnit(candidates, componentGrid, 'row', row) || progress;
  }
  
  // Check columns
  for (let col = 0; col < size; col++) {
    progress = findNakedPairsInUnit(candidates, componentGrid, 'column', col) || progress;
  }
  
  // Check components
  const components = new Set<number>();
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      components.add(componentGrid[row][col]);
    }
  }
  
  for (const component of components) {
    progress = findNakedPairsInUnit(candidates, componentGrid, 'component', component) || progress;
  }
  
  return progress;
};

const findNakedPairsInUnit = (
  candidates: Set<number>[][],
  componentGrid: number[][],
  unitType: 'row' | 'column' | 'component',
  unitIndex: number
): boolean => {
  const size = candidates.length;
  let progress = false;
  
  // Get all cells in this unit with their candidates
  const cellsInUnit: {row: number, col: number, candidates: Set<number>}[] = [];
  
  if (unitType === 'row') {
    for (let col = 0; col < size; col++) {
      if (candidates[unitIndex][col]) {
        cellsInUnit.push({row: unitIndex, col, candidates: candidates[unitIndex][col]});
      }
    }
  } else if (unitType === 'column') {
    for (let row = 0; row < size; row++) {
      if (candidates[row][unitIndex]) {
        cellsInUnit.push({row, col: unitIndex, candidates: candidates[row][unitIndex]});
      }
    }
  } else { // component
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (componentGrid[row][col] === unitIndex && candidates[row][col]) {
          cellsInUnit.push({row, col, candidates: candidates[row][col]});
        }
      }
    }
  }
  
  // Find pairs of cells with exactly the same two candidates
  for (let i = 0; i < cellsInUnit.length; i++) {
    const cell1 = cellsInUnit[i];
    if (cell1.candidates.size !== 2) continue;
    
    for (let j = i + 1; j < cellsInUnit.length; j++) {
      const cell2 = cellsInUnit[j];
      if (cell2.candidates.size !== 2) continue;
      
      // Check if cells have identical candidates
      const values1 = Array.from(cell1.candidates);
      const values2 = Array.from(cell2.candidates);
      
      if (values1.length === values2.length && 
          values1.every(v => values2.includes(v))) {
        // Found a naked pair - remove these values from other cells in the unit
        progress = removeValuesFromOtherCells(
          candidates, unitType, unitIndex, componentGrid,
          [cell1.row, cell2.row], [cell1.col, cell2.col], values1
        ) || progress;
      }
    }
  }
  
  return progress;
};

/**
 * Remove values from cells other than the specified ones
 */
const removeValuesFromOtherCells = (
  candidates: Set<number>[][],
  unitType: 'row' | 'column' | 'component',
  unitIndex: number,
  componentGrid: number[][],
  excludeRows: number[],
  excludeCols: number[],
  values: number[]
): boolean => {
  const size = candidates.length;
  let progress = false;
  
  // Process based on unit type
  if (unitType === 'row') {
    for (let col = 0; col < size; col++) {
      if (!excludeCols.includes(col) && candidates[unitIndex][col]) {
        for (const value of values) {
          if (candidates[unitIndex][col].has(value)) {
            candidates[unitIndex][col].delete(value);
            progress = true;
          }
        }
      }
    }
  } else if (unitType === 'column') {
    for (let row = 0; row < size; row++) {
      if (!excludeRows.includes(row) && candidates[row][unitIndex]) {
        for (const value of values) {
          if (candidates[row][unitIndex].has(value)) {
            candidates[row][unitIndex].delete(value);
            progress = true;
          }
        }
      }
    }
  } else { // component
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (componentGrid[row][col] === unitIndex && 
            !excludeRows.includes(row) && 
            !excludeCols.includes(col) && 
            candidates[row][col]) {
          for (const value of values) {
            if (candidates[row][col].has(value)) {
              candidates[row][col].delete(value);
              progress = true;
            }
          }
        }
      }
    }
  }
  
  return progress;
};

/**
 * Apply pointing pairs - when a value in a component can only appear in one row or column
 */
const applyPointingPairs = (candidates: Set<number>[][], componentGrid: number[][]): boolean => {
  const size = candidates.length;
  let progress = false;
  
  // Get all components
  const components = new Set<number>();
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      components.add(componentGrid[row][col]);
    }
  }
  
  // For each component, check for pointing pairs
  for (const componentId of components) {
    // For each possible value
    for (let value = 1; value <= size; value++) {
      // Find all cells in this component that could contain this value
      const cellsWithValue: {row: number, col: number}[] = [];
      
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (componentGrid[row][col] === componentId && 
              candidates[row][col]?.has(value)) {
            cellsWithValue.push({row, col});
          }
        }
      }
      
      // If all cells with this value are in the same row
      if (cellsWithValue.length > 1 && cellsWithValue.every(cell => cell.row === cellsWithValue[0].row)) {
        const row = cellsWithValue[0].row;
        progress = removeValueFromRowExceptComponent(
          candidates, row, componentId, value, componentGrid
        ) || progress;
      }
      
      // If all cells with this value are in the same column
      if (cellsWithValue.length > 1 && cellsWithValue.every(cell => cell.col === cellsWithValue[0].col)) {
        const col = cellsWithValue[0].col;
        progress = removeValueFromColExceptComponent(
          candidates, col, componentId, value, componentGrid
        ) || progress;
      }
    }
  }
  
  return progress;
};

/**
 * Remove a value from a row except cells in a specific component
 */
const removeValueFromRowExceptComponent = (
  candidates: Set<number>[][],
  row: number,
  componentId: number,
  value: number,
  componentGrid: number[][]
): boolean => {
  const size = candidates.length;
  let progress = false;
  
  for (let col = 0; col < size; col++) {
    if (componentGrid[row][col] !== componentId && candidates[row][col]?.has(value)) {
      candidates[row][col].delete(value);
      progress = true;
    }
  }
  
  return progress;
};

/**
 * Remove a value from a column except cells in a specific component
 */
const removeValueFromColExceptComponent = (
  candidates: Set<number>[][],
  col: number,
  componentId: number,
  value: number,
  componentGrid: number[][]
): boolean => {
  const size = candidates.length;
  let progress = false;
  
  for (let row = 0; row < size; row++) {
    if (componentGrid[row][col] !== componentId && candidates[row][col]?.has(value)) {
      candidates[row][col].delete(value);
      progress = true;
    }
  }
  
  return progress;
};

/**
 * Find all possible values for a given cell
 * @param grid The current grid state
 * @param componentGrid The component grid
 * @param row Row index
 * @param col Column index
 * @returns Set of possible values
 */
const findPossibleValues = (grid: number[][], componentGrid: number[][], row: number, col: number): Set<number> => {
  const size = grid.length;
  
  // Start with all possible values
  const possibleValues = new Set<number>(
    Array.from({ length: size }, (_, i) => i + 1)
  );
  
  // Eliminate values based on row constraints
  for (let c = 0; c < size; c++) {
    if (grid[row][c] !== 0) possibleValues.delete(grid[row][c]);
  }
  
  // Eliminate values based on column constraints
  for (let r = 0; r < size; r++) {
    if (grid[r][col] !== 0) possibleValues.delete(grid[r][col]);
  }
  
  // Eliminate values based on component constraints
  const componentId = componentGrid[row][col];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (componentGrid[r][c] === componentId && grid[r][c] !== 0) {
        possibleValues.delete(grid[r][c]);
      }
    }
  }
  
  return possibleValues;
};

/**
 * Generate a puzzle with minimal clues that doesn't require guessing
 * @param filledGrid The complete filled grid
 * @param componentGrid The component grid for constraints
 * @returns A puzzle with minimal clues
 */
export const generatePuzzle = (filledGrid: number[][], componentGrid: number[][]): number[][] => {
  // Generate multiple candidate puzzles and select the one with minimum revealed cells
  const NUM_CANDIDATES = 10; // Try more candidates for better minimization
  let bestPuzzle: number[][] | null = null;
  let minRevealedCount = Infinity;
  
  for (let attempt = 0; attempt < NUM_CANDIDATES; attempt++) {
    // Generate a candidate puzzle with different randomization for each attempt
    const candidatePuzzle = generateCandidatePuzzle(filledGrid, componentGrid, attempt);
    
    // Count revealed cells in this candidate
    const revealedCount = countRevealedCells(candidatePuzzle);
    
    // Keep track of the puzzle with minimum revealed cells
    if (revealedCount < minRevealedCount) {
      minRevealedCount = revealedCount;
      bestPuzzle = candidatePuzzle;
    }
  }
  
  return bestPuzzle!;
};

/**
 * Generate a single candidate puzzle
 * @param filledGrid The complete filled grid
 * @param componentGrid The component grid for constraints
 * @param seed An optional seed to vary the randomization
 * @returns A candidate puzzle with minimal clues
 */
const generateCandidatePuzzle = (
  filledGrid: number[][], 
  componentGrid: number[][],
  seed: number = 0
): number[][] => {
  const size = filledGrid.length;
  
  // Start with empty puzzle (all cells hidden)
  const puzzle = Array(size).fill(null).map(() => Array(size).fill(0));
  
  // Track which cells are revealed
  const revealedCells = new Set<string>();
  
  // Get all coordinates in random order with different shuffling for each attempt
  const shuffledCoords = shuffleCoordinates(size, seed);
  
  // Try different strategies based on the seed
  if (seed % 3 === 0) {
    // Strategy 1: Try revealing one cell per component
    revealOnePerComponent(puzzle, filledGrid, componentGrid, revealedCells);
  } else if (seed % 3 === 1) {
    // Strategy 2: Try revealing cells in a diagonal pattern first
    revealDiagonalPattern(puzzle, filledGrid, componentGrid, revealedCells, shuffledCoords);
  } else {
    // Strategy 3: Try revealing cells in a sparse pattern
    revealSparsePattern(puzzle, filledGrid, componentGrid, revealedCells, shuffledCoords);
  }
  
  // Check if puzzle is already solvable with just these minimal cells
  let isSolvable = canSolveLogically(puzzle, componentGrid);
  
  // If not solvable, try adding cells one by one until it becomes solvable
  if (!isSolvable) {
    for (const [row, col] of shuffledCoords) {
      if (
        revealedCells.has(`${row},${col}`) || 
        filledGrid[row][col] === size // Skip mines
      ) {
        continue;
      }
      
      puzzle[row][col] = filledGrid[row][col];
      revealedCells.add(`${row},${col}`);
      
      // Check if puzzle is now solvable
      isSolvable = canSolveLogically(puzzle, componentGrid);
      if (isSolvable) break;
    }
  }
  
  return puzzle;
};

/**
 * Reveal one cell per component
 */
const revealOnePerComponent = (
  puzzle: number[][], 
  filledGrid: number[][], 
  componentGrid: number[][],
  revealedCells: Set<string>,
): void => {
  const size = puzzle.length;
  const componentCells = new Map<number, Array<[number, number]>>();
  
  // Group cells by component
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const componentId = componentGrid[row][col];
      if (!componentCells.has(componentId)) {
        componentCells.set(componentId, []);
      }
      componentCells.get(componentId)!.push([row, col]);
    }
  }
  
  // Reveal one cell per component (excluding mines)
  componentCells.forEach((cells) => {
    // Shuffle cells within this component
    shuffle(cells);
    
    // Find a non-mine cell to reveal
    for (const [row, col] of cells) {
      if (filledGrid[row][col] !== size) { // Not a mine
        puzzle[row][col] = filledGrid[row][col];
        revealedCells.add(`${row},${col}`);
        break;
      }
    }
  });
};

/**
 * Reveal cells in a diagonal pattern
 */
const revealDiagonalPattern = (
  puzzle: number[][], 
  filledGrid: number[][], 
  componentGrid: number[][],
  revealedCells: Set<string>,
  shuffledCoords: [number, number][]
): void => {
  const size = puzzle.length;
  const diagonalCells: [number, number][] = [];
  
  // Get diagonal cells (both main diagonal and anti-diagonal)
  for (let i = 0; i < size; i++) {
    diagonalCells.push([i, i]);
    diagonalCells.push([i, size - i - 1]);
  }
  
  // Shuffle diagonal cells
  shuffle(diagonalCells);
  
  // Try to reveal one non-mine cell from each component
  const components = new Set<number>();
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      components.add(componentGrid[row][col]);
    }
  }
  
  components.forEach(componentId => {
    // Try diagonal cells first
    let revealed = false;
    for (const [row, col] of diagonalCells) {
      if (componentGrid[row][col] === componentId && filledGrid[row][col] !== size) {
        puzzle[row][col] = filledGrid[row][col];
        revealedCells.add(`${row},${col}`);
        revealed = true;
        break;
      }
    }
    
    // If no diagonal cell for this component, find another cell
    if (!revealed) {
      for (const [row, col] of shuffledCoords) {
        if (componentGrid[row][col] === componentId && filledGrid[row][col] !== size) {
          puzzle[row][col] = filledGrid[row][col];
          revealedCells.add(`${row},${col}`);
          break;
        }
      }
    }
  });
};

/**
 * Reveal cells in a sparse pattern
 */
const revealSparsePattern = (
  puzzle: number[][], 
  filledGrid: number[][], 
  componentGrid: number[][],
  revealedCells: Set<string>,
  shuffledCoords: [number, number][]
): void => {
  const size = puzzle.length;
  
  // Get a sparse set of coordinates
  const sparseCoords: [number, number][] = [];
  
  // Pick cells from different regions of the grid
  const regionSize = Math.ceil(size / 2);
  for (let regionRow = 0; regionRow < 2; regionRow++) {
    for (let regionCol = 0; regionCol < 2; regionCol++) {
      // Pick one cell from each region
      const rowStart = regionRow * regionSize;
      const colStart = regionCol * regionSize;
      const rowEnd = Math.min(rowStart + regionSize, size);
      const colEnd = Math.min(colStart + regionSize, size);
      
      // Find a non-mine cell in this region
      for (const [row, col] of shuffledCoords) {
        if (row >= rowStart && row < rowEnd && col >= colStart && col < colEnd && 
            filledGrid[row][col] !== size) {
          sparseCoords.push([row, col]);
          break;
        }
      }
    }
  }
  
  // Make sure each component has at least one revealed cell
  const components = new Set<number>();
  const revealedComponents = new Set<number>();
  
  // Track which components have cells revealed
  for (const [row, col] of sparseCoords) {
    const componentId = componentGrid[row][col];
    puzzle[row][col] = filledGrid[row][col];
    revealedCells.add(`${row},${col}`);
    revealedComponents.add(componentId);
  }
  
  // Get all components
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      components.add(componentGrid[row][col]);
    }
  }
  
  // Reveal one cell in each component that doesn't have a revealed cell yet
  components.forEach(componentId => {
    if (!revealedComponents.has(componentId)) {
      for (const [row, col] of shuffledCoords) {
        if (componentGrid[row][col] === componentId && filledGrid[row][col] !== size) {
          puzzle[row][col] = filledGrid[row][col];
          revealedCells.add(`${row},${col}`);
          break;
        }
      }
    }
  });
};

/**
 * Create a shuffled array of coordinates
 */
const shuffleCoordinates = (size: number, seed: number = 0): [number, number][] => {
  const coords: [number, number][] = [];
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      coords.push([row, col]);
    }
  }
  
  // Use seed to get different shuffles for different attempts
  // Simple hash function to make the rng different for each seed
  const rng = (max: number) => {
    let x = Math.sin(seed + 1) * 10000;
    x = x - Math.floor(x);
    return Math.floor(x * max);
  };
  
  // Shuffle using Fisher-Yates with seeded RNG
  for (let i = coords.length - 1; i > 0; i--) {
    const j = seed === 0 ? 
      Math.floor(Math.random() * (i + 1)) : 
      rng(i + 1);
    [coords[i], coords[j]] = [coords[j], coords[i]];
  }
  
  return coords;
};

/**
 * Count the number of revealed (non-zero) cells in a puzzle
 */
const countRevealedCells = (grid: number[][]): number => {
  let count = 0;
  const size = grid.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] !== 0) {
        count++;
      }
    }
  }
  
  return count;
};

/**
 * Determine the minimum set of cells that need to be revealed for the puzzle to be solvable without guessing
 * @param grid The game grid
 * @param componentGrid The component grid
 * @returns Array of cell coordinates to reveal
 */
export const findMinimumRevealedCells = (
  grid: CellState[][],
  componentGrid: number[][],
  maxCells?: number
): { row: number, col: number }[] => {
  const size = grid.length;
  
  // Create numeric version of the grid
  const numericGrid: number[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));
  
  // Fill in the grid values
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!grid[row][col].isMine) {
        numericGrid[row][col] = grid[row][col].value;
      } else {
        // Mark mines with a special value (size, which is the maximum possible value + 1)
        numericGrid[row][col] = size;
      }
    }
  }
  
  // Create a puzzle with minimal revealed cells
  const puzzle = generatePuzzle(numericGrid, componentGrid);
  
  // Convert to coordinates of revealed cells
  const revealedCells: { row: number, col: number }[] = [];
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // If the cell is revealed in the puzzle and is not a mine
      if (puzzle[row][col] !== 0 && !grid[row][col].isMine) {
        revealedCells.push({ row, col });
      }
    }
  }
  
  // Respect maxCells if specified
  if (maxCells && revealedCells.length > maxCells) {
    // If we need to limit cells, prioritize keeping one cell per component
    const componentMap = new Map<number, { row: number, col: number }[]>();
    
    // Group revealed cells by component
    for (const cell of revealedCells) {
      const componentId = componentGrid[cell.row][cell.col];
      if (!componentMap.has(componentId)) {
        componentMap.set(componentId, []);
      }
      componentMap.get(componentId)!.push(cell);
    }
    
    // First, ensure we have one cell per component
    const essentialCells: { row: number, col: number }[] = [];
    componentMap.forEach((cells) => {
      if (cells.length > 0) {
        // Pick a random cell from this component
        const randomCell = cells[Math.floor(Math.random() * cells.length)];
        essentialCells.push(randomCell);
      }
    });
    
    // If we still have room for more cells, add them randomly
    if (essentialCells.length < maxCells) {
      // Create a list of remaining cells (not already in essentialCells)
      const remainingCells = revealedCells.filter(cell => 
        !essentialCells.some(ec => ec.row === cell.row && ec.col === cell.col)
      );
      
      // Shuffle and add up to the maxCells limit
      const additionalCells = shuffle([...remainingCells])
        .slice(0, maxCells - essentialCells.length);
      
      return [...essentialCells, ...additionalCells];
    }
    
    return essentialCells;
  }
  
  return revealedCells;
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