'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Menu, X } from "lucide-react";

export default function LateralMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { gridSize, setGridSize } = useSettings();

  const handleGridSizeChange = (value: string) => {
    setGridSize(parseInt(value));
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="z-30 flex items-center gap-2 p-2 h-auto border-foreground"
        aria-label="Open menu"
      >
        <div
          style={{
            width: '42px',
            height: '42px',
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
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-4">
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
              variant="outline"
              className="justify-start border-foreground p-3 h-auto min-h-[48px] min-w-[48px]"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-8 w-8" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Game Modes</h3>
              <nav className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start border-foreground py-4 h-auto min-h-[48px] text-base"
                  asChild
                >
                  <Link href="/game/zen" onClick={() => setIsOpen(false)}>
                    Zen Mode
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-foreground py-4 h-auto min-h-[48px] text-base"
                  asChild
                >
                  <Link href="/game/classic" onClick={() => setIsOpen(false)}>
                    Classic Mode
                  </Link>
                </Button>
              </nav>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Grid Size</h3>
              <Select value={gridSize.toString()} onValueChange={handleGridSizeChange}>
                <SelectTrigger className="w-full border-foreground min-h-[48px] group">
                  <SelectValue placeholder="Select grid size" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7].map((size) => (
                    <SelectItem
                      key={size}
                      value={size.toString()}
                      className="min-h-[40px]"
                    >
                      {size} x {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}