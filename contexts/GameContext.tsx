'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useReducer, useRef } from 'react';
import { CellState, generateSolvedGrid, handleCellClick } from '@/lib/sudoku-minesweeper';

// Define grid progression and consecutive win parameters
export const GRID_PROGRESSION = [3, 4, 5, 6, 7, 8];
export const MAX_CONSECUTIVE_WINS_FOR_PROGRESSION = 3;

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

    default:
      return state;
  }
}

// Export the context so it can be used directly by other components
export const GameContext = createContext<GameContextType | undefined>(undefined);

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
    if (mode === gameMode) return;

    dispatchGameMode({ type: 'SET_MODE', payload: { mode } });

    setGameOver(false);
    setGameWon(false);
    setMessage("");

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
    if (!gameMode) return;

    setIsLoading(true);
    setIsNewGridCreated(false);

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

    worker.onerror = () => {
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