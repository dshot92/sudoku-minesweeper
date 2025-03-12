'use client';

import Grid from "@/components/Grid";
import { useGame, GRID_PROGRESSION } from "@/contexts/GameContext";
import { useEffect } from "react";

export default function ClassicMode() {
  const { setGameMode } = useGame();

  useEffect(() => {
    // Always start with the smallest grid and initialize the game
    // The customSetGameMode function in GameContext now handles both
    // setting the grid size and initializing the game
    setGameMode('classic');
  }, [setGameMode]);

  return (
    <main className="flex-1 flex items-center justify-center relative">
      <Grid />
    </main>
  );
} 