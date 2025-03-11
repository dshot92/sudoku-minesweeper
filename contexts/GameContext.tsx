'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CellState, generateSolvedGrid } from '@/lib/sudoku-minesweeper';
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
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { gridSize } = useSettings();
  const [grid, setGrid] = useState<CellState[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    initializeGame();
  }, [gridSize]);

  const initializeGame = () => {
    setMessage("");
    const newGrid = generateSolvedGrid(gridSize);
    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
  };

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
        setMessage
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