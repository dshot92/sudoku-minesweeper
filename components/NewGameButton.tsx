'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
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

  return (
    <Button onClick={initializeGame} className="flex items-center gap-2 p-2 h-auto">
      <div className={theme === 'light' ? 'invert-[1]' : ''}>
        <Image
          src={gameOver ? "/game-button/lost.svg" : gameWon ? "/game-button/win.svg" : "/game-button/new.svg"}
          alt={gameOver ? "Game Over" : gameWon ? "You Won!" : "New Game"}
          width={32}
          height={32}
          priority
        />
      </div>
    </Button>
  );
} 