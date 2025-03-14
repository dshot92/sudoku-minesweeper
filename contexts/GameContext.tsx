'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useReducer, useRef } from 'react';
import { CellState, generateSolvedGrid, handleCellClick } from '@/lib/sudoku-minesweeper';

// Define grid progression and consecutive win parameters
export const GRID_PROGRESSION = [3, 4, 5, 6, 7, 8];
export const MAX_CONSECUTIVE_WINS_FOR_PROGRESSION = 3;

// Define local storage keys
const STORAGE_KEY_PREFIX = 'sudoku-minesweeper';
const CLASSIC_STORAGE_KEY = `${STORAGE_KEY_PREFIX}-classic`;
const ZEN_STORAGE_KEY = `${STORAGE_KEY_PREFIX}-zen`;
const LAST_PLAYED_MODE_KEY = `${STORAGE_KEY_PREFIX}-last-mode`;

// Define the interface for the saved game state
interface SavedGameState {
  grid: CellState[][];
  gameOver: boolean;
  gameWon: boolean;
  message: string;
  gridSize: number;
  hints: number;
  hintUsageCount: number;
  consecutiveWins: number;
  nextGridSize: number | null;
  timestamp: number; // To track when the game was saved
}

// Export the interface so it can be used by other components
export interface GameContextType {
  // Core Game State
  grid: CellState[][];
  gameOver: boolean;
  gameWon: boolean;
  message: string;
  isLoading: boolean;
  isNewGridCreated: boolean;

  // Grid Configuration
  gridSize: number;
  gridProgression: number[];
  nextGridSize: number | null;
  maxConsecutiveWinsForProgression: number;

  // Game Mode
  gameMode?: 'classic' | 'zen';

  // Game Progress
  hints: number;
  hintUsageCount: number;
  consecutiveWins: number;

  // State Setters
  setGrid: (grid: CellState[][]) => void;
  setGameOver: (gameOver: boolean) => void;
  setGameWon: (gameWon: boolean) => void;
  setMessage: (message: string) => void;
  setGridSize: (size: number) => void;
  setHints: (hints: number) => void;
  setGameMode: (mode: 'classic' | 'zen') => void;

  // Game Actions
  initializeGame: () => void;
  handleCellClick: (row: number, col: number) => { newGrid: CellState[][]; gameOver: boolean; gameWon: boolean; message: string };
  incrementHintUsage: () => void;
  incrementConsecutiveWins: () => void;
  resetConsecutiveWins: () => void;
  getNextGridSize: () => number;
  generateNewGrid: () => void;

  // New function for changing grid size in zen mode
  changeZenModeGridSize: (size: number) => void;
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
  | { type: 'INITIALIZE', payload: { defaultSize: number } }
  | { type: 'RESTORE_STATE', payload: { state: GameModeState } };

// Game mode reducer for more predictable state updates
function gameModeReducer(state: GameModeState, action: GameModeAction): GameModeState {
  switch (action.type) {
    case 'SET_MODE':
      if (action.payload.mode === state.gameMode) {
        return state;
      }

      const newState = { ...state };

      if (state.gameMode === 'zen') {
        newState.zenGridSize = state.currentGridSize;
      } else if (state.gameMode === 'classic') {
        newState.classicGridSize = state.currentGridSize;
      }

      newState.gameMode = action.payload.mode;
      newState.currentGridSize = action.payload.mode === 'zen'
        ? newState.zenGridSize
        : newState.classicGridSize;

      return newState;

    case 'SET_GRID_SIZE':
      const updatedState = { ...state, currentGridSize: action.payload.size };

      if (state.gameMode === 'zen') {
        updatedState.zenGridSize = action.payload.size;
      } else if (state.gameMode === 'classic') {
        updatedState.classicGridSize = action.payload.size;
      }

      return updatedState;

    case 'INITIALIZE':
      return {
        gameMode: 'classic',
        zenGridSize: GRID_PROGRESSION[0],
        classicGridSize: GRID_PROGRESSION[0],
        currentGridSize: GRID_PROGRESSION[0]
      };

    case 'RESTORE_STATE':
      return action.payload.state;

    default:
      return state;
  }
}

// Helper function to safely parse JSON from localStorage
function safelyParseJSON(json: string | null): any | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to parse JSON from localStorage:', e);
    return null;
  }
}

// Export the context so it can be used directly by other components
export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // Track initialization
  const isInitialized = useRef(false);
  const hasRestoredState = useRef(false);

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
  const { gameMode, currentGridSize } = gameModeState;

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
  const [isNewGridCreated, setIsNewGridCreated] = useState(false);

  // Function to save the current game state to localStorage
  const saveGameState = useCallback(() => {
    if (!gameMode) return;

    // Don't save if grid is empty or not properly initialized
    if (!grid || grid.length === 0) {
      return;
    }

    const stateToSave: SavedGameState = {
      grid,
      gameOver,
      gameWon,
      message,
      gridSize: currentGridSize,
      hints,
      hintUsageCount,
      consecutiveWins,
      nextGridSize,
      timestamp: Date.now()
    };

    const storageKey = gameMode === 'classic' ? CLASSIC_STORAGE_KEY : ZEN_STORAGE_KEY;

    try {
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      localStorage.setItem(LAST_PLAYED_MODE_KEY, gameMode);
    } catch (e) {
      console.error('Failed to save game state to localStorage:', e);
    }
  }, [
    gameMode, grid, gameOver, gameWon, message,
    currentGridSize, hints, hintUsageCount, consecutiveWins, nextGridSize
  ]);

  // Function to restore game state from localStorage
  const restoreGameState = useCallback((mode: 'classic' | 'zen') => {
    const storageKey = mode === 'classic' ? CLASSIC_STORAGE_KEY : ZEN_STORAGE_KEY;
    const savedStateJSON = localStorage.getItem(storageKey);

    const savedState = safelyParseJSON(savedStateJSON) as SavedGameState | null;

    if (savedState) {
      console.log(`Restoring ${mode} mode state`, {
        gridSize: savedState.gridSize,
        gridLength: savedState.grid.length,
        savedAt: new Date(savedState.timestamp).toISOString()
      });

      setGrid(savedState.grid);
      setGameOver(savedState.gameOver);
      setGameWon(savedState.gameWon);
      setMessage(savedState.message);
      setHints(savedState.hints);
      setHintUsageCount(savedState.hintUsageCount);
      setConsecutiveWins(savedState.consecutiveWins);
      setNextGridSize(savedState.nextGridSize);

      // Update grid size in the reducer
      dispatchGameMode({
        type: 'SET_GRID_SIZE',
        payload: { size: savedState.gridSize }
      });

      return true;
    }

    return false;
  }, []);

  // Initialize the game state
  useEffect(() => {
    if (!isInitialized.current) {
      // Initialize the game mode state
      dispatchGameMode({
        type: 'INITIALIZE',
        payload: { defaultSize: GRID_PROGRESSION[0] }
      });

      // Try to restore the last played mode
      if (typeof window !== 'undefined') {
        const lastPlayedMode = localStorage.getItem(LAST_PLAYED_MODE_KEY) as 'classic' | 'zen' | null;
        if (lastPlayedMode) {
          dispatchGameMode({
            type: 'SET_MODE',
            payload: { mode: lastPlayedMode }
          });
        }
      }

      isInitialized.current = true;
    }
  }, []);

  // Custom setGameMode using the reducer
  const customSetGameMode = useCallback((mode: 'classic' | 'zen') => {

    if (mode === gameMode) {
      return;
    }

    // Save current state before switching modes
    if (gameMode) {
      saveGameState();
    }

    dispatchGameMode({ type: 'SET_MODE', payload: { mode } });
    hasRestoredState.current = false;

    // Don't reset these here as we'll try to restore from localStorage first
    // setGameOver(false);
    // setGameWon(false);
    // setMessage("");

    // if (mode === 'classic' && gameMode !== 'classic') {
    //   setConsecutiveWins(0);
    // }
  }, [gameMode, saveGameState]);

  // Custom setGridSize using the reducer
  const customSetGridSize = useCallback((size: number) => {

    // If we're in zen mode, we want to clear the saved state for the current grid size
    // This ensures that when we switch back to this grid size, we'll get a fresh grid
    if (gameMode === 'zen') {
      try {
        // We don't need to clear the entire zen state, just mark it as needing a new grid
        const savedStateJSON = localStorage.getItem(ZEN_STORAGE_KEY);
        if (savedStateJSON) {
          const savedState = safelyParseJSON(savedStateJSON) as SavedGameState | null;
          if (savedState && savedState.gridSize === size) {
            localStorage.removeItem(ZEN_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('Failed to clear saved state:', e);
      }
    }

    dispatchGameMode({ type: 'SET_GRID_SIZE', payload: { size } });
  }, [gameMode, currentGridSize]);

  // Unified grid generation function
  const generateNewGrid = useCallback(() => {
    if (!gameMode) return;

    setIsLoading(true);
    setIsNewGridCreated(false);

    // Reset game state when generating a new grid
    setGameOver(false);
    setGameWon(false);
    setMessage("");

    let gameInitSize = currentGridSize;

    if (gameMode === 'classic' && nextGridSize !== null) {
      gameInitSize = nextGridSize;
      dispatchGameMode({ type: 'SET_GRID_SIZE', payload: { size: nextGridSize } });
      setNextGridSize(null);
    }

    if (gameMode === 'classic' && shouldResetConsecutiveWins) {
      setConsecutiveWins(0);
      setShouldResetConsecutiveWins(false);
    }

    setHints(gameInitSize);

    const worker = new Worker(new URL('/workers/sudoku-minesweeper.worker', import.meta.url));

    worker.onmessage = (event: MessageEvent) => {
      if (event.data.error) {
        setMessage("Failed to generate grid.");
      } else {
        const cellStates: CellState[][] = event.data.grid;
        const componentGrid = event.data.componentGrid;

        if (!cellStates || cellStates.length !== gameInitSize || cellStates[0].length !== gameInitSize ||
          !componentGrid || componentGrid.length !== gameInitSize || componentGrid[0].length !== gameInitSize) {
          setMessage("Failed to generate grid.");
          setIsLoading(false);
          worker.terminate();
          return;
        }

        setGrid(cellStates);
        setIsNewGridCreated(true);

        setTimeout(() => {
          setIsNewGridCreated(false);
        }, 1500);

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

  // Restore game state when game mode changes
  useEffect(() => {
    if (isInitialized.current && gameMode && !hasRestoredState.current) {
      const restored = restoreGameState(gameMode);
      hasRestoredState.current = true;

      // Only generate a new grid if we couldn't restore the state
      if (!restored) {
        generateNewGrid();
      }
    }
  }, [isInitialized.current, gameMode, restoreGameState, generateNewGrid]);

  // Save game state whenever relevant state changes
  useEffect(() => {
    if (gameMode && !isLoading) {
      // Add a small delay to ensure all state updates have been applied
      // This is especially important after generating a new grid
      setTimeout(() => {
        saveGameState();
      }, 100);
    }
  }, [
    gameMode, grid, gameOver, gameWon,
    currentGridSize, hints, hintUsageCount,
    consecutiveWins, nextGridSize, saveGameState, isLoading
  ]);

  const initializeGame = useCallback(() => {
    setMessage("");
    setGameOver(false);
    setGameWon(false);
    generateNewGrid();
  }, [generateNewGrid]);

  // New method to get the next grid size
  const getNextGridSize = useCallback(() => {
    const currentIndex = GRID_PROGRESSION.indexOf(currentGridSize);
    return currentIndex < GRID_PROGRESSION.length - 1
      ? GRID_PROGRESSION[currentIndex + 1]
      : currentGridSize;
  }, [currentGridSize]);

  const incrementHintUsage = useCallback(() => {
    setHintUsageCount(prev => prev + 1);
  }, []);

  const incrementConsecutiveWins = useCallback(() => {
    if (gameMode !== 'classic') return;

    const newConsecutiveWins = consecutiveWins + 1;
    setConsecutiveWins(newConsecutiveWins);

    if (newConsecutiveWins >= MAX_CONSECUTIVE_WINS_FOR_PROGRESSION) {
      const currentIndex = GRID_PROGRESSION.indexOf(currentGridSize);

      if (currentIndex >= 0 && currentIndex < GRID_PROGRESSION.length - 1) {
        setShouldResetConsecutiveWins(true);
        setMessage(`Level up!`);
        setNextGridSize(GRID_PROGRESSION[currentIndex + 1]);
      }
    }
  }, [gameMode, currentGridSize, consecutiveWins]);

  const resetConsecutiveWins = useCallback(() => {
    setConsecutiveWins(0);
  }, []);

  // Function to change grid size and generate a new grid (specifically for zen mode)
  const changeZenModeGridSize = useCallback((size: number) => {
    if (gameMode !== 'zen') return;

    // Clear any existing saved state for zen mode to ensure a fresh start
    try {
      localStorage.removeItem(ZEN_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear saved state:', e);
    }

    // Reset game state
    setGameOver(false);
    setGameWon(false);
    setMessage("");
    setIsLoading(true);

    // First update the grid size
    dispatchGameMode({ type: 'SET_GRID_SIZE', payload: { size } });

    // Set hints to match the new grid size
    setHints(size);

    // Use a timeout to ensure state updates have been applied before generating the grid
    setTimeout(() => {
      // Generate a new grid with the updated size
      const worker = new Worker(new URL('/workers/sudoku-minesweeper.worker', import.meta.url));

      worker.onmessage = (event: MessageEvent) => {
        if (event.data.error) {
          setMessage("Failed to generate grid.");
        } else {
          const cellStates: CellState[][] = event.data.grid;
          const componentGrid = event.data.componentGrid;

          if (!cellStates || cellStates.length !== size || cellStates[0].length !== size ||
            !componentGrid || componentGrid.length !== size || componentGrid[0].length !== size) {
            setMessage("Failed to generate grid.");
            setIsLoading(false);
            worker.terminate();
            return;
          }

          setGrid(cellStates);
          setIsNewGridCreated(true);

          setTimeout(() => {
            setIsNewGridCreated(false);
          }, 1500);

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

      worker.postMessage({ type: "generateGrid", size });
    }, 50);

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
    gridSize: currentGridSize,
    setGridSize: customSetGridSize,
    changeZenModeGridSize,
    hints,
    setHints,
    hintUsageCount,
    incrementHintUsage,
    consecutiveWins,
    incrementConsecutiveWins,
    resetConsecutiveWins,
    handleCellClick: (row: number, col: number) => {
      if (gameWon || gameOver) {
        generateNewGrid();
        setGameOver(false);
        setGameWon(false);
        setMessage("");
        return { newGrid: grid, gameOver: false, gameWon: false, message: "" };
      }

      const result = handleCellClick(grid, row, col, currentGridSize);
      setGrid(result.newGrid);

      if (result.gameWon) {
        setGameWon(true);
        setMessage(result.message || "Congratulations! You won!");

        if (gameMode === 'classic') {
          queueMicrotask(() => {
            incrementConsecutiveWins();
          });
        }
      }

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
    isNewGridCreated,
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