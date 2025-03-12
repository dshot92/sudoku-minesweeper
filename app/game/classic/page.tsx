'use client';

import Grid from "@/components/Grid";
import { useGame } from "@/contexts/GameContext";
import { useEffect, useRef } from "react";

export default function ClassicMode() {
  const { setGameMode, gameMode, consecutiveWins } = useGame();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only set the game mode once when the component first mounts
    if (!initializedRef.current) {
      setGameMode('classic');
      initializedRef.current = true;
    }
  }, [setGameMode]);

  useEffect(() => {
    // Verify game mode is set correctly
  }, [gameMode]);

  // Added to track win changes
  useEffect(() => {
  }, [consecutiveWins]);

  return (
    <div className="w-full h-full max-w-xl flex items-center justify-center">
      <Grid />
    </div>
  );
} 