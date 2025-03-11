'use client';

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useGame } from "@/contexts/GameContext";
import { useEffect } from "react";

export default function NewGameButton() {
  const { theme } = useTheme();
  const { gameOver, gameWon, initializeGame } = useGame();

  // Initialize game on first render
  useEffect(() => {
    initializeGame();
  }, []);

  // Add keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R' || event.key === 'F2') {
        initializeGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initializeGame]);

  return (
    <Button onClick={initializeGame} className="flex items-center gap-2 p-2 h-auto">
      <div
        style={{
          width: '32px',
          height: '32px',
          WebkitMask: `url(${gameOver ? "/game-button/lost.svg" : gameWon ? "/game-button/win.svg" : "/game-button/new.svg"}) center/contain no-repeat`,
          mask: `url(${gameOver ? "/game-button/lost.svg" : gameWon ? "/game-button/win.svg" : "/game-button/new.svg"}) center/contain no-repeat`,
          backgroundColor: 'var(--foreground)',
          background: 'var(--background)'
        }}
      />
    </Button>
  );
} 
