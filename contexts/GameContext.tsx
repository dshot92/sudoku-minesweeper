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
    console.log("🎮 Initializing Game with current state:", {
      consecutiveWins,
      gameMode,
      gridSize,
      gameOver,
      gameWon
    });

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
      currentGridProgression: GRID_PROGRESSION,
      consecutiveWins
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
    // If we're already in this mode, don't do anything to avoid resetting progress
    if (gameMode === mode) {
      console.log(`🔄 Already in ${mode} mode, ignoring mode switch request`);
      return;
    }

    console.log('🔄 Switching Game Mode:', {
      currentMode: gameMode,
      newMode: mode,
      currentGridSize: gridSize,
      zenGridSize,
      classicGridSize,
      GRID_PROGRESSION
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
      // Only reset to smallest grid size when first entering classic mode
      // or coming from another mode, not when already in classic
      const classicSize = gameMode === 'classic' ? classicGridSize : GRID_PROGRESSION[0];

      console.log('🎮 Initializing classic mode with size:', classicSize);

      setGridSize(classicSize);
      setClassicGridSize(classicSize);

      // Only reset consecutive wins when first entering classic mode
      if (gameMode !== 'classic') {
        setConsecutiveWins(0);
        console.log('🔄 Reset consecutive wins - new to classic mode');
      }

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
      // Similar code for zen mode...
    }
  }, [gameMode, gridSize, zenGridSize, setZenGridSize, setClassicGridSize, setGridSize, setGameMode, setConsecutiveWins, classicGridSize, initializeGame]);

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
    // Ensure we're in classic mode before proceeding - extra safety check
    if (gameMode !== 'classic') {
      console.log('⚠️ incrementConsecutiveWins called but not in classic mode:', gameMode);
      return;
    }

    console.log('⭐ incrementConsecutiveWins called, current state:', {
      consecutiveWins,
      gameMode,
      gridSize,
      progression: GRID_PROGRESSION,
      threshold: MAX_CONSECUTIVE_WINS_FOR_PROGRESSION
    });

    // Calculate new win count ahead of time
    const newConsecutiveWins = consecutiveWins + 1;
    console.log(`🏆 Calculating new consecutive wins: ${consecutiveWins} → ${newConsecutiveWins}`);

    // Check if we've reached the max consecutive wins for progression
    if (newConsecutiveWins >= MAX_CONSECUTIVE_WINS_FOR_PROGRESSION) {
      // Automatically progress grid size if possible
      const currentIndex = GRID_PROGRESSION.indexOf(gridSize);

      console.log('📊 Checking grid progression:', {
        currentIndex,
        gridSize,
        GRID_PROGRESSION,
        maxIndex: GRID_PROGRESSION.length - 1
      });

      if (currentIndex >= 0 && currentIndex < GRID_PROGRESSION.length - 1) {
        const nextGridSize = GRID_PROGRESSION[currentIndex + 1];

        console.log('🚀 LEVEL UP! Progressing Grid Size:', {
          currentGridSize: gridSize,
          nextGridSize,
          gameMode,
          newConsecutiveWins
        });

        // COMPLETELY REVISED APPROACH: Use a fresh clean slate approach

        // 1. Reset consecutive wins counter first
        setConsecutiveWins(0);
        console.log('🔄 Reset consecutive wins to 0 for next level');

        // 2. Set message to inform user about level change
        setMessage(`Level up! Grid size increased to ${nextGridSize}x${nextGridSize}`);

        // 3. Create a completely fresh game with the new size
        // Instead of updating piece by piece, create an entirely new complete game state
        setTimeout(() => {
          // First reset all game state
          setGameOver(false);
          setGameWon(false);
          setIsLoading(true);

          // Then update size tracking
          setClassicGridSize(nextGridSize);
          setGridSize(nextGridSize);
          setHints(nextGridSize);

          // Create a fresh temporary grid of the correct size
          const tempGrid = Array(nextGridSize).fill(null).map(() =>
            Array(nextGridSize).fill(null).map(() => ({
              value: 0,
              revealed: false,
              isMine: false,
              componentId: 0
            }))
          );
          setGrid(tempGrid);

          // Finally start the worker with the EXACT grid size
          console.log('🎮 Starting fresh worker with EXACT new grid size:', nextGridSize);
          const worker = new Worker(new URL('/workers/sudoku-minesweeper.worker', import.meta.url));

          worker.onmessage = (event: MessageEvent) => {
            if (event.data.error) {
              console.error("Error from worker:", event.data.error);
              setMessage("Failed to generate grid.");
              setIsLoading(false);
            } else {
              const cellStates: CellState[][] = event.data.grid;

              // Triple-check grid size from worker
              if (!cellStates || cellStates.length !== nextGridSize || cellStates[0].length !== nextGridSize) {
                console.error("Invalid grid size from worker", {
                  expectedSize: nextGridSize,
                  actualSize: cellStates?.length,
                  receivedGrid: cellStates
                });

                // Force correct size if worker returned wrong size
                if (cellStates) {
                  // Create a properly sized grid using available data
                  const correctedGrid = Array(nextGridSize).fill(null).map((_, row) =>
                    Array(nextGridSize).fill(null).map((_, col) => {
                      // Use data from worker if available, otherwise create empty cell
                      if (cellStates[row] && cellStates[row][col]) {
                        return cellStates[row][col];
                      } else {
                        return {
                          value: (row + col) % nextGridSize + 1, // Simple deterministic value
                          revealed: false,
                          isMine: false,
                          componentId: Math.floor(row / 2) * 2 + Math.floor(col / 2) // Simple component grouping
                        };
                      }
                    })
                  );
                  setGrid(correctedGrid);
                } else {
                  // Fallback to generateSolvedGrid
                  const backupGrid = generateSolvedGrid(nextGridSize);
                  setGrid(backupGrid);
                }
                setMessage("Grid generated with corrections.");
                setIsLoading(false);
                worker.terminate();
                return;
              }

              console.log('✅ Worker generated correct grid size:', cellStates.length);
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

          worker.postMessage({ type: "generateGrid", size: nextGridSize });
        }, 100);
      } else {
        console.log('⛔ Cannot progress grid size - already at maximum level or invalid index');
        // Still increment wins even if we can't progress
        setConsecutiveWins(newConsecutiveWins);
      }
    } else {
      // Just increment wins if we're not at the threshold yet
      console.log(`⏫ Incrementing consecutive wins to ${newConsecutiveWins}`);
      setConsecutiveWins(newConsecutiveWins);
    }
  }, [gameMode, gridSize, consecutiveWins, MAX_CONSECUTIVE_WINS_FOR_PROGRESSION, GRID_PROGRESSION, setClassicGridSize, setConsecutiveWins, setGrid, setHints, generateSolvedGrid, setGameOver, setGameWon, setIsLoading, setMessage]);

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
      // Skip if game already won or over
      if (gameWon || gameOver) {
        console.log('Game already in end state, ignoring click');
        return { newGrid: grid, gameOver, gameWon, message };
      }

      const result = handleCellClick(grid, row, col, gridSize);

      // Debug logging
      console.log('🎲 Game Click Result:', {
        row,
        col,
        gridSize,
        gameMode,
        gameWon: result.gameWon,
        gameOver: result.gameOver,
        message: result.message,
        currentConsecutiveWins: consecutiveWins
      });

      // Always update the grid
      setGrid(result.newGrid);

      // Handle game won condition
      if (result.gameWon) {
        console.log('🏆 Game Won! Setting game state and incrementing consecutive wins');

        // Set game state first
        setGameWon(true);
        setMessage(result.message || "Congratulations! You won!");

        // Then increment consecutive wins for classic mode in its own sync block
        if (gameMode === 'classic') {
          console.log('🔢 About to increment consecutive wins in classic mode, current:', consecutiveWins);

          // We want to process this immediately and not batch it with other state updates
          queueMicrotask(() => {
            incrementConsecutiveWins();
            console.log('🔢 Incremented consecutive wins in classic mode');
          });
        }
      }

      // Handle game over condition
      if (result.gameOver) {
        console.log('💥 Game Over! Setting game state and resetting consecutive wins');
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