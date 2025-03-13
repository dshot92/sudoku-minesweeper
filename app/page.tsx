'use client';

import { useGame } from '@/contexts/GameContext';
import Link from 'next/link';

export default function Home() {
  const { setGameMode } = useGame();

  const handleModeSelect = (mode: 'zen' | 'classic') => {
    setGameMode(mode);
  };

  return (
    <main className="min-h-screen px-8 max-w-md mx-auto bg-background grid grid-rows-[auto_1fr] pt-16">

      <div className="w-full mx-auto">
        <h1 className="text-5xl font-bold">sudoku</h1>
        <h1 className="text-5xl font-bold">minesweeper</h1>
      </div>

      <div className="grid place-items-center">
        <div className="w-full space-y-4 ">
          <Link
            href="/game/zen"
            onClick={() => handleModeSelect('zen')}
            className="block w-full p-4 text-center bg-primary text-primary-foreground rounded-lg "
          >
            Zen Mode
          </Link>
          <Link
            href="/game/classic"
            onClick={() => handleModeSelect('classic')}
            className="block w-full p-4 text-center bg-primary text-primary-foreground rounded-lg "
          >
            Classic Mode
          </Link>
          <Link
            href="/tutorial"
            className="block w-full p-4 text-center bg-primary text-primary-foreground rounded-lg "
          >
            How to Play
          </Link>
        </div>
      </div>
    </main>
  );
} 