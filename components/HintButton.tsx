'use client';

import { Button } from '@/components/ui/button';
import { generateHint, handleCellClick } from '@/lib/sudoku-minesweeper';
import { useGame } from '@/contexts/GameContext';

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

  return (
    <Button
      variant="outline"
      onClick={handleHint}
      className="z-30 flex p-2 h-auto border-foreground"
      aria-label="Open menu"
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
