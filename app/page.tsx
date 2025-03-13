'use client';

import { useGame } from '@/contexts/GameContext';
import Link from 'next/link';

export default function Home() {
  const { setGameMode } = useGame();

  const handleModeSelect = (mode: 'zen' | 'classic') => {
    setGameMode(mode);
  };

  return (
    <main className="min-h-screen px-8 bg-background grid grid-rows-[auto_1fr] pt-16">

      <div className="w-full max-w-md mx-auto">
        <h1 className="text-5xl font-bold">sudoku</h1>
        <h1 className="text-5xl font-bold">minesweeper</h1>
      </div>

      <div className="grid place-items-center">
        <div className="w-full max-w-md space-y-10 ">
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