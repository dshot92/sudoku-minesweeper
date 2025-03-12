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
      console.log('📱 Setting game mode to classic (INITIAL SETUP ONLY)');
      setGameMode('classic');
      initializedRef.current = true;
    }
  }, []); // Empty dependency array ensures this only runs once on mount

  useEffect(() => {
    // Verify game mode is set correctly
    console.log('🎮 Current game mode in classic page:', gameMode);
  }, [gameMode]);

  // Added to track win changes
  useEffect(() => {
    console.log('🏆 Consecutive wins changed in classic page:', consecutiveWins);
  }, [consecutiveWins]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <Grid />
    </div>
  );
} 