'use client';

import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { useEffect } from "react";

const BUTTON_ICONS = {
  LOST: "/game-button/lost.svg",
  WIN: "/game-button/win.svg",
  NEW: "/game-button/new.svg",
} as const;

export default function NewGameButton() {
  const { gameOver, gameWon, initializeGame, isLoading } = useGame();

  // Initialize game on first render
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

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

  const getButtonIcon = () => {
    if (gameOver) return BUTTON_ICONS.LOST;
    if (gameWon) return BUTTON_ICONS.WIN;
    return BUTTON_ICONS.NEW;
  };

  return (
    <Button
      onClick={initializeGame}
      className="flex items-center gap-2 p-2 h-auto"
      aria-label={"New Game"}
      disabled={isLoading}
    >
      {isLoading ? (
        <div style={{
          width: '36px',
          height: '36px',
          WebkitMask: `url(${getButtonIcon()}) center/contain no-repeat`,
          mask: `url(${getButtonIcon()}) center/contain no-repeat`,
          backgroundColor: 'var(--foreground)',
          background: 'var(--background)',
          animation: 'spin 0.5s linear infinite',
          transition: 'transform 0.5s ease-in-out',
        }}
        />
      ) : (
        <div style={{
          width: '39px',
          height: '39px',
          WebkitMask: `url(${getButtonIcon()}) center/contain no-repeat`,
          mask: `url(${getButtonIcon()}) center/contain no-repeat`,
          backgroundColor: 'var(--foreground)',
          background: 'var(--background)'
        }} />
      )}
    </Button>
  );
}
