'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Menu, X } from "lucide-react";
import { useGame, GRID_PROGRESSION } from '@/contexts/GameContext';

export default function LateralMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { gridSize, setGridSize, setGameMode, gameMode, changeZenModeGridSize } = useGame();
  const pathname = usePathname();

  const handleGridSizeChange = (value: string) => {
    const newSize = parseInt(value);

    // Only generate a new grid if we're in zen mode
    if (isZenMode && gameMode === 'zen') {
      // Close the menu first to avoid UI issues during grid generation
      setIsOpen(false);
      // Use setTimeout to ensure the menu is closed before changing the grid
      setTimeout(() => {
        changeZenModeGridSize(newSize);
      }, 100);
    } else {
      setGridSize(newSize);
      setIsOpen(false);
    }
  };

  const isZenMode = pathname === '/game/zen';
  const isClassicMode = pathname === '/game/classic';

  const handleModeChange = (mode: 'zen' | 'classic') => {
    setGameMode(mode);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="z-30 flex p-2 h-auto border-foreground"
        aria-label="Open menu"
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Menu size={42} strokeWidth={3} />
        </div>
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-background border-l transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <ThemeToggle />
            <Button
              variant="outline"
              className="justify-start border-foreground"
              asChild
            >
              <Link href="/" onClick={() => setIsOpen(false)}>
                Home
              </Link>
            </Button>
            <Button
              variant={"outline"}
              className="justify-center border-foreground w-12 h-12 p-2"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Game Modes</h3>
              <nav className="space-y-4">
                <Button
                  variant={isZenMode ? "default" : "outline"}
                  className="w-full justify-start border-foreground py-2 h-12 text-base"
                  asChild
                  onClick={() => handleModeChange('zen')}
                >
                  <Link href="/game/zen">
                    Zen Mode
                  </Link>
                </Button>
                <Button
                  variant={isClassicMode ? "default" : "outline"}
                  className="w-full justify-start border-foreground py-2 h-12 text-base"
                  asChild
                  onClick={() => handleModeChange('classic')}
                >
                  <Link href="/game/classic">
                    Classic Mode
                  </Link>
                </Button>
              </nav>
            </div>

            {isZenMode && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Grid Size</h3>
                <Select value={gridSize.toString()} onValueChange={handleGridSizeChange}>
                  <SelectTrigger
                    className="w-full border-foreground group border-4 py-2 h-auto min-h-[36px] text-base"
                  >
                    <SelectValue placeholder="Select grid size" />
                  </SelectTrigger>
                  <SelectContent
                    className="border-4 border-foreground"
                  >
                    {GRID_PROGRESSION.map((size) => (
                      <SelectItem
                        key={size}
                        value={size.toString()}
                        className="min-h-[36px]"
                      >
                        {size} x {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
