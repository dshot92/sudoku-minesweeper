'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { useSettings } from '@/contexts/SettingsContext';

export default function LateralMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { gridSize, setGridSize } = useSettings();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 rounded-lg hover:bg-secondary/80"
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

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
            <h2 className="text-xl font-bold">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-secondary/80"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Game Modes</h3>
              <nav className="space-y-2">
                <Link
                  href="/"
                  className="block px-2 py-1 rounded-lg hover:bg-secondary/80"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/game/zen"
                  className="block px-2 py-1 rounded-lg hover:bg-secondary/80"
                  onClick={() => setIsOpen(false)}
                >
                  Zen Mode
                </Link>
                <Link
                  href="/game/classic"
                  className="block px-2 py-1 rounded-lg hover:bg-secondary/80"
                  onClick={() => setIsOpen(false)}
                >
                  Classic Mode
                </Link>
              </nav>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm block mb-1">Grid Size</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGridSize(Math.max(3, gridSize - 1))}
                      className="p-2 rounded-lg border bg-background hover:bg-secondary/80"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center">{gridSize}x{gridSize}</span>
                    <button
                      onClick={() => setGridSize(Math.min(7, gridSize + 1))}
                      className="p-2 rounded-lg border bg-background hover:bg-secondary/80"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm block mb-1">Theme</label>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}