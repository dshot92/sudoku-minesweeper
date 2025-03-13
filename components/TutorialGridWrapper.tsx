'use client';

import React from 'react';
import Grid from './Grid';
import { TutorialCellState } from '@/lib/tutorialGridGenerator';
import { CellState } from '@/lib/sudoku-minesweeper';
import {
  GameContext,
  GameContextType,
  GRID_PROGRESSION,
  MAX_CONSECUTIVE_WINS_FOR_PROGRESSION
} from '@/contexts/GameContext';

interface TutorialGridWrapperProps {
  tutorialGrid: TutorialCellState[][];
  onCellClick: (row: number, col: number) => void;
  helpText: string;
}

// Adapter function to convert TutorialCellState to CellState
const adaptTutorialGridToCellState = (tutorialGrid: TutorialCellState[][]): CellState[][] => {
  return tutorialGrid.map(row =>
    row.map(cell => ({
      ...cell,
      // Any additional properties CellState might need that TutorialCellState doesn't have
    } as CellState))
  );
};

export default function TutorialGridWrapper({
  tutorialGrid,
  onCellClick,
  helpText,
}: TutorialGridWrapperProps) {
  // Convert tutorial grid to the format expected by Grid
  const adaptedGrid = adaptTutorialGridToCellState(tutorialGrid);

  // Create a mock game context value that uses our tutorial data
  const contextValue: GameContextType = {
    grid: adaptedGrid,
    gridSize: 4,
    gameOver: false,
    gameWon: false,
    isLoading: false,
    message: "",
    initializeGame: () => { },
    setGrid: () => { },
    setGameOver: () => { },
    setGameWon: () => { },
    setMessage: () => { },
    setGridSize: () => { },
    hints: 4,
    setHints: () => { },
    hintUsageCount: 0,
    incrementHintUsage: () => { },
    consecutiveWins: 0,
    incrementConsecutiveWins: () => { },
    resetConsecutiveWins: () => { },
    handleCellClick: (row: number, col: number) => {
      onCellClick(row, col);
      return {
        newGrid: adaptedGrid,
        gameOver: false,
        gameWon: false,
        message: ""
      };
    },
    gridProgression: GRID_PROGRESSION,
    maxConsecutiveWinsForProgression: MAX_CONSECUTIVE_WINS_FOR_PROGRESSION,
    getNextGridSize: () => 4,
    gameMode: 'classic' as const,
    setGameMode: () => { },
    nextGridSize: null,
    generateNewGrid: () => { },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <GameContext.Provider value={contextValue}>
          <Grid />
        </GameContext.Provider>
      </div>

      {/* Help text container - always present but conditionally visible */}
      <div className="h-8 mt-2 text-center text-sm">
        {helpText ? (
          <p className="bg-card rounded-md p-1">{helpText}</p>
        ) : (
          // Invisible placeholder
          <p className="opacity-0 p-1">&#8203;</p>
        )}
      </div>
    </div>
  );
} 