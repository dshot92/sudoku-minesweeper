'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useReducer, useRef } from 'react';
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
  nextGridSize: number | null;
  generateNewGrid: () => void;
}

// Define game mode state interface
interface GameModeState {
  gameMode: 'classic' | 'zen' | undefined;
  zenGridSize: number;
  classicGridSize: number;
  currentGridSize: number;
}

// Define actions for the reducer
type GameModeAction =
  | { type: 'SET_MODE', payload: { mode: 'classic' | 'zen' } }
  | { type: 'SET_GRID_SIZE', payload: { size: number } }
  | { type: 'INITIALIZE', payload: { defaultSize: number } };

// Game mode reducer for more predictable state updates
function gameModeReducer(state: GameModeState, action: GameModeAction): GameModeState {
  switch (action.type) {
    case 'SET_MODE':
      // If we're already in this mode, don't do anything
      if (action.payload.mode === state.gameMode) {
        return state;
      }

      // Create a copy of the state
      const newState = { ...state };

      // First, save the current grid size to the appropriate mode-specific state
      // Only if we have a current mode (not undefined)
      if (state.gameMode === 'zen') {
        newState.zenGridSize = state.currentGridSize;
      } else if (state.gameMode === 'classic') {
        newState.classicGridSize = state.currentGridSize;
      }

      // Now set the new mode
      newState.gameMode = action.payload.mode;

      // Then set the current grid size based on the new mode
      if (action.payload.mode === 'zen') {
        newState.currentGridSize = newState.zenGridSize;
      } else if (action.payload.mode === 'classic') {
        newState.currentGridSize = newState.classicGridSize;
      }

      return newState;

    case 'SET_GRID_SIZE':
      // Always update the current grid size
      const updatedState = { ...state, currentGridSize: action.payload.size };

      // Also update the mode-specific size
      if (state.gameMode === 'zen') {
        updatedState.zenGridSize = action.payload.size;
      } else if (state.gameMode === 'classic') {
        updatedState.classicGridSize = action.payload.size;
      }

      return updatedState;

    case 'INITIALIZE':
      // Initialize with default values
      return {
        gameMode: 'classic', // Set classic as default mode immediately
        zenGridSize: action.payload.defaultSize,
        classicGridSize: action.payload.defaultSize,
        currentGridSize: action.payload.defaultSize
      };

    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // Track initialization
  const isInitialized = useRef(false);

  // Use reducer for game mode and grid size state
  const [gameModeState, dispatchGameMode] = useReducer(
    gameModeReducer,
    {
      gameMode: undefined,
      zenGridSize: GRID_PROGRESSION[0],
      classicGridSize: GRID_PROGRESSION[0],
      currentGridSize: GRID_PROGRESSION[0]
    }
  );

  // Destructure values from the reducer state
  const { gameMode, zenGridSize, classicGridSize, currentGridSize } = gameModeState;

  // Other state variables
  const [nextGridSize, setNextGridSize] = useState<number | null>(null);
  const [grid, setGrid] = useState<CellState[][]>(generateSolvedGrid(GRID_PROGRESSION[0]));
  const [hints, setHints] = useState(GRID_PROGRESSION[0]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hintUsageCount, setHintUsageCount] = useState(0);
  const [consecutiveWins, setConsecutiveWins] = useState(0);
  const [shouldResetConsecutiveWins, setShouldResetConsecutiveWins] = useState(false);

  // Initialize the game state
  useEffect(() => {
    if (!isInitialized.current) {
      // Initialize the game mode state
      dispatchGameMode({
        type: 'INITIALIZE',
        payload: { defaultSize: GRID_PROGRESSION[0] }
      });

      isInitialized.current = true;
    }
  }, []);

  // Generate grid when needed
  useEffect(() => {
    // Only generate grid after we have a game mode
    if (isInitialized.current && gameMode) {
      generateNewGrid();
    }
  }, [isInitialized.current, gameMode]);

  // Custom setGameMode using the reducer
  const customSetGameMode = useCallback((mode: 'classic' | 'zen') => {
    // Don't do anything if we're already in this mode
    if (mode === gameMode) {
      return;
    }

    // Dispatch the mode change action
    dispatchGameMode({ type: 'SET_MODE', payload: { mode } });

    // Reset game state but don't generate a new grid
    setGameOver(false);
    setGameWon(false);
    setMessage("");

    // Reset consecutive wins when entering classic mode from a different mode
    if (mode === 'classic' && gameMode !== 'classic') {
      setConsecutiveWins(0);
    }
  }, [gameMode]);

  // Custom setGridSize using the reducer
  const customSetGridSize = useCallback((size: number) => {
    dispatchGameMode({ type: 'SET_GRID_SIZE', payload: { size } });
  }, []);

  // Unified grid generation function
  const generateNewGrid = useCallback(() => {
    if (!gameMode) {
      return; // Don't generate if game mode isn't set yet
    }

    setIsLoading(true);

    // Determine the grid size to use
    let gameInitSize = currentGridSize;

    // Apply the next grid size if available (for classic mode)
    if (gameMode === 'classic' && nextGridSize !== null) {
      gameInitSize = nextGridSize;

      // Update grid size state
      dispatchGameMode({ type: 'SET_GRID_SIZE', payload: { size: nextGridSize } });

      // Clear the pending grid size change
      setNextGridSize(null);
    }

    // Reset consecutive wins when starting a new game in classic mode
    // but only if we're explicitly flagged to do so (after level progression)
    if (gameMode === 'classic' && shouldResetConsecutiveWins) {
      setConsecutiveWins(0);
      setShouldResetConsecutiveWins(false);
    }

    // Update hints
    setHints(gameInitSize);

    // Generate the grid with the worker
    const worker = new Worker(new URL('/workers/sudoku-minesweeper.worker', import.meta.url));

    worker.onmessage = (event: MessageEvent) => {
      if (event.data.error) {
        setMessage("Failed to generate grid.");
      } else {
        const cellStates: CellState[][] = event.data.grid;

        // Double-check grid size from worker
        if (!cellStates || cellStates.length !== gameInitSize || cellStates[0].length !== gameInitSize) {
          setMessage("Failed to generate grid.");
          return;
        }

        setGrid(cellStates);
        const componentGrid = event.data.componentGrid;
        if (!componentGrid || componentGrid.length !== gameInitSize || componentGrid[0].length !== gameInitSize) {
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
      setMessage("Failed to generate grid.");
      setIsLoading(false);
      worker.terminate();
    };

    worker.postMessage({ type: "generateGrid", size: gameInitSize });
  }, [currentGridSize, nextGridSize, gameMode, shouldResetConsecutiveWins]);

  const initializeGame = useCallback(() => {
    setMessage("");
    setGameOver(false);
    setGameWon(false);

    // Generate a new grid
    generateNewGrid();
  }, [generateNewGrid]);

  // New method to get the next grid size
  const getNextGridSize = useCallback(() => {
    const currentIndex = GRID_PROGRESSION.indexOf(currentGridSize);
    if (currentIndex < GRID_PROGRESSION.length - 1) {
      return GRID_PROGRESSION[currentIndex + 1];
    }
    return currentGridSize; // Stay at the current size if at the maximum
  }, [currentGridSize]);

  const incrementHintUsage = useCallback(() => {
    setHintUsageCount(prev => prev + 1);
  }, []);

  const incrementConsecutiveWins = useCallback(() => {
    // Ensure we're in classic mode before proceeding - extra safety check
    if (gameMode !== 'classic') {
      return;
    }

    // Calculate new win count ahead of time
    const newConsecutiveWins = consecutiveWins + 1;

    // Always update the consecutive wins count first
    setConsecutiveWins(newConsecutiveWins);

    // Check if we've reached the max consecutive wins for progression
    if (newConsecutiveWins >= MAX_CONSECUTIVE_WINS_FOR_PROGRESSION) {
      // Automatically progress grid size if possible
      const currentIndex = GRID_PROGRESSION.indexOf(currentGridSize);

      if (currentIndex >= 0 && currentIndex < GRID_PROGRESSION.length - 1) {
        const newNextGridSize = GRID_PROGRESSION[currentIndex + 1];

        // Don't reset consecutive wins immediately, flag for reset on next game
        setShouldResetConsecutiveWins(true);

        setMessage(`Level up!`);
        // Store the next grid size, but don't apply it yet
        setNextGridSize(newNextGridSize);
      }
    }
  }, [gameMode, currentGridSize, consecutiveWins]);

  const resetConsecutiveWins = useCallback(() => {
    // Only reset the consecutive win count, don't change the grid size
    setConsecutiveWins(0);
  }, []);

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
    gridSize: currentGridSize,
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
        // Instead of skipping completely, allow clicking to start a new game
        generateNewGrid();
        setGameOver(false);
        setGameWon(false);
        setMessage("");
        return { newGrid: grid, gameOver: false, gameWon: false, message: "" };
      }

      const result = handleCellClick(grid, row, col, currentGridSize);

      // Always update the grid
      setGrid(result.newGrid);

      // Handle game won condition
      if (result.gameWon) {
        // Set game state first
        setGameWon(true);
        setMessage(result.message || "Congratulations! You won!");

        // Then increment consecutive wins for classic mode in its own sync block
        if (gameMode === 'classic') {
          // We want to process this immediately and not batch it with other state updates
          queueMicrotask(() => {
            incrementConsecutiveWins();
          });
        }
      }

      // Handle game over condition
      if (result.gameOver) {
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
    nextGridSize,
    generateNewGrid,
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