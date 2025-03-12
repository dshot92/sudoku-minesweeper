'use client';

import Grid from "@/components/Grid";
import { useGame } from "@/contexts/GameContext";
import { useEffect } from "react";

export default function ZenMode() {
  const { setGameMode } = useGame();

  useEffect(() => {
    // Explicitly set the game mode to 'zen'
    // The customSetGameMode function in GameContext now handles both
    // setting the grid size and initializing the game
    setGameMode('zen');
  }, [setGameMode]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Grid />
    </div>
  );
}