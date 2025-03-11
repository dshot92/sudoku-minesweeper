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
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-30"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
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
              variant="ghost"
              className="justify-start"
              asChild
            >
              <Link href="/" onClick={() => setIsOpen(false)}>
                Home
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Game Modes</h3>
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/game/zen" onClick={() => setIsOpen(false)}>
                    Zen Mode
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/game/classic" onClick={() => setIsOpen(false)}>
                    Classic Mode
                  </Link>
                </Button>
              </nav>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grid Size</label>
                  <Select value={gridSize.toString()} onValueChange={handleGridSizeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grid size" />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} x {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}