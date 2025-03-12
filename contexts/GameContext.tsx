'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { CellState } from '@/lib/sudoku-minesweeper';
import { useSettings } from './SettingsContext';

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
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { gridSize } = useSettings();
  const [grid, setGrid] = useState<CellState[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const initializeGame = useCallback(() => {
    setMessage("");
    setIsLoading(true);
    setGameOver(false);
    setGameWon(false);
    setGrid([]);

    const worker = new Worker(new URL('/workers/sudoku-minesweeper.worker', import.meta.url));

    worker.onmessage = (event: MessageEvent) => {
      if (event.data.error) {
        console.error("Error from worker:", event.data.error);
        setMessage("Failed to generate grid.");
      } else {
        const cellStates: CellState[][] = event.data.grid;
        setGrid(cellStates);
        const componentGrid = event.data.componentGrid;
        if (!componentGrid || componentGrid.length !== gridSize || componentGrid[0].length !== gridSize) {
          console.error("Invalid component grid received from worker");
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

    worker.postMessage({ type: "generateGrid", size: gridSize });
  }, [gridSize]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <GameContext.Provider
      value={{
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
      }}
    >
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