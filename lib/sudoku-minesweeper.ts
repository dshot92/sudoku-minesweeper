// Re-export types and functionality from modular files
import { CellState } from './types';
import { 
  generateSolvedGrid, 
  generateGridWithDifficulty,
  createConnectedComponents,
  fisherYatesShuffle,
  cloneDeep,
  shuffle,
  getAllCoordinates
} from './grid-generator';
import {
  handleCellClick,
  isGameWon,
  revealMinesInCompletedComponents,
  flagMinesInCompletedRowsAndColumns,
  revealLastRemainingCell,
  areAllMinesFlagged,
  revealAllCells
} from './handle-click';
import {
  findMinimumRevealedCells,
  generateHint,
  calculateDifficulty,
  hasUniqueSolution,
  generatePuzzle
} from './solve-logic';

export {
  // Grid generation
  generateSolvedGrid,
  generateGridWithDifficulty,
  createConnectedComponents,
  
  // Game logic
  handleCellClick,
  isGameWon,
  revealMinesInCompletedComponents,
  flagMinesInCompletedRowsAndColumns,
  revealLastRemainingCell,
  areAllMinesFlagged,
  revealAllCells,
  
  // Solving functions
  findMinimumRevealedCells,
  generateHint,
  calculateDifficulty,
  hasUniqueSolution,
  generatePuzzle,
  
  // Utilities
  fisherYatesShuffle,
  cloneDeep,
  shuffle,
  getAllCoordinates
};

// Export types separately
export type { CellState };