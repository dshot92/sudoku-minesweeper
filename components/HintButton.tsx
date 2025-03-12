'use client';

import { Button } from '@/components/ui/button';
import { generateHint, handleCellClick } from '@/lib/sudoku-minesweeper';
import { useGame } from '@/contexts/GameContext';
import { useEffect } from 'react';

export function HintButton() {
  const {
    grid,
    setGrid,
    gridSize,
    incrementHintUsage,
    setGameWon,
    setMessage
  } = useGame();

  const handleHint = () => {
    // Generate a hint
    const hintCell = generateHint(grid);

    if (hintCell) {
      // Simulate a cell click to reveal the hinted cell
      const {
        newGrid,
        gameWon,
        message
      } = handleCellClick(grid, hintCell.row, hintCell.col, gridSize);

      // Update grid and increment hint usage
      setGrid(newGrid);
      incrementHintUsage();

      // Update game state if won
      if (gameWon) {
        setGameWon(true);
        setMessage(message);
      }
    }
  };

  // Add keyboard event listener for 'h' key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if 'h' key is pressed
      if (event.key.toLowerCase() === 'h') {
        handleHint();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [grid, gridSize, incrementHintUsage, setGameWon, setGrid, setMessage]);

  return (
    <Button
      variant="outline"
      onClick={handleHint}
      className="z-30 flex p-2 h-auto border-foreground"
      aria-label="Get Hint"
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          WebkitMask: `url(/game-button/bulb.svg) center/contain no-repeat`,
          mask: `url(/game-button/bulb.svg) center/contain no-repeat`,
          backgroundColor: 'var(--background)',
          background: 'var(--foreground)'
        }}
      >
      </div>
    </Button>
  );
}
