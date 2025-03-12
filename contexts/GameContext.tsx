'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { CellState, generateSolvedGrid, handleCellClick } from '@/lib/sudoku-minesweeper';

// Define grid progression and consecutive win parameters
export const GRID_PROGRESSION = [3, 4, 5, 6, 7, 8];
export const MAX_CONSECUTIVE_WINS_FOR_PROGRESSION = 3;

interface GameContextType {
  grid: CellState[][];
  gameOver: boolean;
  gameWon: boolean;
  message: string;
  initializeGame: () => void;
  setGrid: (grid: CellState[][]) => void;
  setGameOver: (gameOver: boolean) => void;
  setGameWon: (gameWon: boolean) => void;
  setMessage: (message: string) => void;
  isLoading: boolean;
  gridSize: number;
  setGridSize: (size: number) => void;
  hints: number;
  setHints: (hints: number) => void;
  hintUsageCount: number;
  incrementHintUsage: () => void;
  consecutiveWins: number;
  incrementConsecutiveWins: () => void;
  resetConsecutiveWins: () => void;
  handleCellClick: (row: number, col: number) => { newGrid: CellState[][]; gameOver: boolean; gameWon: boolean; message: string };
  gridProgression: number[];
  maxConsecutiveWinsForProgression: number;
  getNextGridSize: () => number;
  gameMode?: 'classic' | 'zen';
  setGameMode: (mode: 'classic' | 'zen') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [zenGridSize, setZenGridSize] = useState(GRID_PROGRESSION[0]);
  const [classicGridSize, setClassicGridSize] = useState(GRID_PROGRESSION[0]);
  const [gridSize, setGridSize] = useState(GRID_PROGRESSION[0]);
  const [grid, setGrid] = useState<CellState[][]>(generateSolvedGrid(GRID_PROGRESSION[0]));
  const [hints, setHints] = useState(GRID_PROGRESSION[0]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hintUsageCount, setHintUsageCount] = useState(0);
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [gameMode, setGameMode] = useState<'classic' | 'zen' | undefined>(undefined);

  const initializeGame = useCallback(() => {
    setMessage("");
    setIsLoading(true);
    setGameOver(false);
    setGameWon(false);

    // For classic mode, use the stored classic grid size
    // For zen mode, use the stored zen grid size
    const gameInitSize = gameMode === 'classic'
      ? (classicGridSize || GRID_PROGRESSION[0])
      : (zenGridSize || GRID_PROGRESSION[0]);

    console.log('🔍 Initializing Game (MODE-AWARE):', {
      gameMode,
      zenGridSize,
      classicGridSize,
      gameInitSize,
      currentGridProgression: GRID_PROGRESSION
    });

    // Explicitly set grid size based on game mode
    setGridSize(gameInitSize);

    // Regenerate the grid with the EXACT correct size
    const newGrid = generateSolvedGrid(gameInitSize);
    setGrid(newGrid);
    setHints(gameInitSize);

    const worker = new Worker(new URL('/workers/sudoku-minesweeper.worker', import.meta.url));

    worker.onmessage = (event: MessageEvent) => {
      if (event.data.error) {
        console.error("Error from worker:", event.data.error);
        setMessage("Failed to generate grid.");
      } else {
        const cellStates: CellState[][] = event.data.grid;

        // Double-check grid size from worker
        if (!cellStates || cellStates.length !== gameInitSize || cellStates[0].length !== gameInitSize) {
          console.error("Invalid grid size from worker", {
            expectedSize: gameInitSize,
            actualSize: cellStates?.length
          });
          setMessage("Failed to generate grid.");
          return;
        }

        setGrid(cellStates);
        const componentGrid = event.data.componentGrid;
        if (!componentGrid || componentGrid.length !== gameInitSize || componentGrid[0].length !== gameInitSize) {
          console.error("Invalid component grid received from worker", {
            expectedSize: gameInitSize,
            actualSize: componentGrid?.length
          });
          setMessage("Failed to generate grid.");
          return;
        }
        worker.postMessage({
          type: "generatePuzzle",
          filledGrid: cellStates.map((row: CellState[]) => row.map(cell => cell.value)),
          componentGrid,
        });
      }
      setIsLoading(false);
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error("Worker error:", error);
      setMessage("Failed to generate grid.");
      setIsLoading(false);
      worker.terminate();
    };

    worker.postMessage({ type: "generateGrid", size: gameInitSize });
  }, [zenGridSize, classicGridSize, gameMode]);

  // Custom setGameMode to handle grid size preservation
  const customSetGameMode = useCallback((mode: 'classic' | 'zen') => {
    console.log('🔄 Switching Game Mode:', {
      currentMode: gameMode,
      newMode: mode,
      currentGridSize: gridSize,
      zenGridSize,
      classicGridSize
    });

    // First, store the current grid size for the current mode
    if (gameMode === 'zen' && mode === 'classic') {
      setZenGridSize(gridSize);
    } else if (gameMode === 'classic' && mode === 'zen') {
      setClassicGridSize(gridSize);
    }

    // Then set the game mode
    setGameMode(mode);

    // Instead of using setTimeout, we'll handle the grid size change and game initialization
    // in a more predictable way by doing it directly after setting the mode
    if (mode === 'classic') {
      // Always reset to smallest grid size for classic
      const classicSize = GRID_PROGRESSION[0];
      setGridSize(classicSize);
      setClassicGridSize(classicSize);

      // Use a specific init function for classic mode to ensure correct size
      const newGrid = generateSolvedGrid(classicSize);
      setGrid(newGrid);
      setHints(classicSize);
      setMessage("");
      setIsLoading(true);
      setGameOver(false);
      setGameWon(false);

      // Initialize game with specific size
      const worker = new Worker(new URL('/workers/sudoku-minesweeper.worker', import.meta.url));

      worker.onmessage = (event: MessageEvent) => {
        if (event.data.error) {
          console.error("Error from worker:", event.data.error);
          setMessage("Failed to generate grid.");
        } else {
          const cellStates: CellState[][] = event.data.grid;

          // Double-check grid size from worker
          if (!cellStates || cellStates.length !== classicSize || cellStates[0].length !== classicSize) {
            console.error("Invalid grid size from worker", {
              expectedSize: classicSize,
              actualSize: cellStates?.length
            });
            setMessage("Failed to generate grid.");
            return;
          }

          setGrid(cellStates);
          const componentGrid = event.data.componentGrid;
          worker.postMessage({
            type: "generatePuzzle",
            filledGrid: cellStates.map((row: CellState[]) => row.map(cell => cell.value)),
            componentGrid,
          });
        }
        setIsLoading(false);
        worker.terminate();
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
        setMessage("Failed to generate grid.");
        setIsLoading(false);
        worker.terminate();
      };

      worker.postMessage({ type: "generateGrid", size: classicSize });
    } else if (mode === 'zen') {
      // For zen mode, use the stored zen grid size
      // Make sure we're using the stored zen grid size that was saved when switching to classic
      console.log('📊 Restoring Zen Size:', { zenGridSize });

      // Initialize zen mode with specific size - mirroring the classic mode approach
      const zenSize = zenGridSize || GRID_PROGRESSION[0];
      setGridSize(zenSize);

      // Similar to classic mode, let's be explicit about initialization
      const newGrid = generateSolvedGrid(zenSize);
      setGrid(newGrid);
      setHints(zenSize);
      setMessage("");
      setIsLoading(true);
      setGameOver(false);
      setGameWon(false);

      // Initialize game with specific size
      const worker = new Worker(new URL('/workers/sudoku-minesweeper.worker', import.meta.url));

      worker.onmessage = (event: MessageEvent) => {
        if (event.data.error) {
          console.error("Error from worker:", event.data.error);
          setMessage("Failed to generate grid.");
        } else {
          const cellStates: CellState[][] = event.data.grid;

          // Double-check grid size from worker
          if (!cellStates || cellStates.length !== zenSize || cellStates[0].length !== zenSize) {
            console.error("Invalid grid size from worker", {
              expectedSize: zenSize,
              actualSize: cellStates?.length
            });
            setMessage("Failed to generate grid.");
            return;
          }

          setGrid(cellStates);
          const componentGrid = event.data.componentGrid;
          worker.postMessage({
            type: "generatePuzzle",
            filledGrid: cellStates.map((row: CellState[]) => row.map(cell => cell.value)),
            componentGrid,
          });
        }
        setIsLoading(false);
        worker.terminate();
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
        setMessage("Failed to generate grid.");
        setIsLoading(false);
        worker.terminate();
      };

      worker.postMessage({ type: "generateGrid", size: zenSize });
    }
  }, [gameMode, gridSize, zenGridSize, initializeGame]);

  // Modify setGridSize to update the appropriate mode-specific grid size
  const customSetGridSize = useCallback((size: number) => {
    console.log('🔢 Setting Grid Size:', {
      currentMode: gameMode,
      newSize: size,
      zenGridSize,
      classicGridSize,
      currentGridSize: gridSize
    });

    if (gameMode === 'zen') {
      // Update both zen grid size and current grid size
      setZenGridSize(size);
      setGridSize(size);

      // Reinitialize game with the new grid size
      initializeGame();
    } else if (gameMode === 'classic') {
      // Update both classic grid size and current grid size
      setClassicGridSize(size);
      setGridSize(size);

      // Reinitialize game with the new grid size
      initializeGame();
    } else {
      // For other/undefined modes, just set the grid size
      setGridSize(size);
    }
  }, [gameMode, zenGridSize, classicGridSize, gridSize, initializeGame]);

  // New method to get the next grid size
  const getNextGridSize = useCallback(() => {
    const currentIndex = GRID_PROGRESSION.indexOf(gridSize);
    if (currentIndex < GRID_PROGRESSION.length - 1) {
      return GRID_PROGRESSION[currentIndex + 1];
    }
    return gridSize; // Stay at the current size if at the maximum
  }, [gridSize]);

  const incrementHintUsage = useCallback(() => {
    setHintUsageCount(prev => prev + 1);
  }, []);

  const incrementConsecutiveWins = useCallback(() => {
    setConsecutiveWins(prev => {
      const newConsecutiveWins = prev + 1;

      // Check if we've reached the max consecutive wins for progression
      if (gameMode === 'classic' && newConsecutiveWins >= MAX_CONSECUTIVE_WINS_FOR_PROGRESSION) {
        // Automatically progress grid size if possible
        const currentIndex = GRID_PROGRESSION.indexOf(gridSize);
        if (currentIndex < GRID_PROGRESSION.length - 1) {
          const nextGridSize = GRID_PROGRESSION[currentIndex + 1];

          console.log('🚀 Progressing Grid Size:', {
            currentGridSize: gridSize,
            nextGridSize,
            gameMode
          });

          // Update both classic grid size and current grid size
          setClassicGridSize(nextGridSize);
          setGridSize(nextGridSize);

          initializeGame(); // Restart game with new grid size
        }
      }

      return newConsecutiveWins;
    });
  }, [gameMode, gridSize, initializeGame]);

  const resetConsecutiveWins = useCallback(() => {
    if (gameMode === 'classic') {
      // For classic mode, reset to the first (smallest) grid size
      const resetSize = GRID_PROGRESSION[0];

      console.log('🔄 Resetting Grid Size:', {
        currentGridSize: gridSize,
        resetSize,
        gameMode
      });

      // Update both classic grid size and current grid size
      setClassicGridSize(resetSize);
      setGridSize(resetSize);

      initializeGame();
    }
    setConsecutiveWins(0);
  }, [gameMode, gridSize, initializeGame]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Optional: Add a console log to debug mode setting
  useEffect(() => {
    console.log('Current Game Mode:', gameMode);
  }, [gameMode]);

  const value = {
    grid,
    gameOver,
    gameWon,
    message,
    initializeGame,
    setGrid,
    setGameOver,
    setGameWon,
    setMessage,
    isLoading,
    gridSize,
    setGridSize: customSetGridSize,
    hints,
    setHints,
    hintUsageCount,
    incrementHintUsage,
    consecutiveWins,
    incrementConsecutiveWins,
    resetConsecutiveWins,
    handleCellClick: (row: number, col: number) => {
      const result = handleCellClick(grid, row, col, gridSize);

      // Debug logging
      console.error('🎲 Game Click Result:', {
        gameWon: result.gameWon,
        gameOver: result.gameOver,
        message: result.message
      });

      // Always update the grid
      setGrid(result.newGrid);

      // Handle game won condition
      if (result.gameWon) {
        console.error('🏆 Game Won! Setting game state');
        setGameWon(true);
        setMessage(result.message || "Congratulations! You won!");
        incrementConsecutiveWins();
      }

      // Handle game over condition
      if (result.gameOver) {
        console.error('💥 Game Over! Setting game state');
        setGameOver(true);
        setMessage(result.message || "Game Over! Try again.");
        resetConsecutiveWins();
      }

      return result;
    },
    gridProgression: GRID_PROGRESSION,
    maxConsecutiveWinsForProgression: MAX_CONSECUTIVE_WINS_FOR_PROGRESSION,
    getNextGridSize,
    gameMode,
    setGameMode: customSetGameMode,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export const useGameContext = useGame; // Alias for backwards compatibility