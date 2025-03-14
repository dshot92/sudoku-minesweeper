'use client';

import Grid from "@/components/Grid";
import { useGame } from "@/contexts/GameContext";
import { useEffect, useRef } from "react";

export default function ZenMode() {
  const { setGameMode, gameMode, grid, generateNewGrid } = useGame();
  const initializedRef = useRef(false);
  const gridInitializedRef = useRef(false);

  // Set the game mode once when the component first mounts
  useEffect(() => {
    if (!initializedRef.current) {
      setGameMode('zen');
      initializedRef.current = true;
    }
  }, [setGameMode]);

  // Ensure grid is initialized
  useEffect(() => {
    if (gameMode === 'zen' && (!grid || grid.length === 0) && !gridInitializedRef.current) {
      generateNewGrid();
      gridInitializedRef.current = true;
    }
  }, [gameMode, grid, generateNewGrid]);



  return (
    <div className="w-full h-full max-w-xl flex items-center justify-center">
      <Grid />
    </div>
  );
}