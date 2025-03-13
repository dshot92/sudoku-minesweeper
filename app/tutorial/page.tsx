'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TutorialGridWrapper from '@/components/TutorialGridWrapper';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import {
  TutorialCellState,
  generateNumbersGrid,
  generateMinesGrid,
  generateRegionCompletionGrid,
  generateWinningGrid
} from '@/lib/tutorialGridGenerator';

const tutorialSteps = [
  {
    title: "The Basics",
    content: `<p>Each region contains numbers 1 through N (where N is the grid size). Each row and column also contains numbers 1 through N. These cells show how numbers can't repeat in rows or columns. Try revealing more cells!</p>`,
    gridGenerator: generateNumbersGrid,
  },
  {
    title: "The Mines",
    content: `<p>Each colored region contains exactly one mine. The mine is always the highest number in that region. These cells show the mines - notice they're always the number 4 in a 4x4 grid. Try revealing more cells!</p>`,
    gridGenerator: generateMinesGrid,
  },
  {
    title: "Region Completion",
    content: `<p>When you reveal all non-mine cells in a region, the mine is automatically revealed safely. This region shows where you can try this - reveal the remaining cells to see what happens!</p>`,
    gridGenerator: generateRegionCompletionGrid,
  },
  {
    title: "Winning the Game",
    content: `<p>You win when all cells (including mines) are revealed. Some cells are already revealed to get you started - try to reveal the rest! Remember the rules you've learned about mines and regions.</p>`,
    gridGenerator: generateWinningGrid,
  },
  {
    title: "Game Modes",
    content: `<div class="space-y-4">
  <div class="bg-card p-4 rounded-lg ">
    <h3 class="text-foreground font-bold text-lg mb-2">Zen Mode</h3>
    <p class="text-foreground">
      Unlimited puzzles, zero stress. <span class="font-semibold">Jump between grid sizes</span>, experiment freely, and play at your own pace. 
      No tracking, no pressure - just pure puzzle solving.
    </p>
  </div>
  <div class="bg-card p-4 rounded-lg ">
    <h3 class="text-foreground font-bold text-lg mb-2">Classic Mode</h3>
    <p class="text-foreground">
      A true test of skill. <span class="font-semibold">Start at 4×4 and climb the grid sizes</span>. 
      Win 3 games in a row to level up. New Game doesn't count against you - so push your limits without fear.
    </p>
  </div>
</div>`,
  },
  {
    title: "Ready to Play?",
    content: `<p>Choose your game mode to start playing!</p>`,
  },
];

export default function TutorialPage() {
  const [step, setStep] = useState(0);
  const [grid, setGrid] = useState<TutorialCellState[][]>([]);
  const [previousGrid, setPreviousGrid] = useState<TutorialCellState[][]>([]);
  const [mineClicked, setMineClicked] = useState(false);

  const currentStep = tutorialSteps[step];
  const isLastStep = step === tutorialSteps.length - 1;
  const showGrid = step < 4;

  // Update grid when step changes
  useEffect(() => {
    const currentTutorialStep = tutorialSteps[step];

    if (currentTutorialStep.gridGenerator) {
      const newGrid = currentTutorialStep.gridGenerator();
      setGrid(newGrid);
      setPreviousGrid(newGrid);
      setMineClicked(false);
    }
  }, [step]);

  const handleCellClick = (row: number, col: number) => {
    // Don't allow interaction on steps that don't need it
    if (step >= 4) return;

    if (mineClicked) {
      // Reset the grid to previous state
      setGrid(JSON.parse(JSON.stringify(previousGrid)));
      setMineClicked(false);
      return;
    }

    // Don't allow clicking already revealed cells
    if (grid[row][col].revealed) return;

    const newGrid = JSON.parse(JSON.stringify(grid)); // Deep clone
    const clickedCell = newGrid[row][col];

    if (clickedCell.isMine) {
      // Reveal all cells if a mine is clicked
      newGrid.forEach((row: TutorialCellState[]) => row.forEach((cell: TutorialCellState) => cell.revealed = true));
      setMineClicked(true);
    } else {
      // Just reveal the clicked cell
      clickedCell.revealed = true;
    }

    setGrid(newGrid);
  };

  const nextStep = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="bg-background min-h-screen h-screen grid grid-rows-[auto_1fr_auto]">
      {/* Header */}
      <header className="w-full">
        <div className="container h-full p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
          <Link href="/">
            <Button variant="outline" className="grid grid-flow-col gap-2 border-foreground w-[42px] h-[42px] p-0">
              <Home size={24} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-center">How to Play</h1>
          {/* Spacer for alignment */}
          <div className="w-[42px]"></div>
        </div>
      </header>

      {/* Main content area - grid layout with fixed rows */}
      <main className="grid grid-rows-[auto_1fr] overflow-hidden">
        {/* Title and description */}
        <div className="w-full py-4">
          <div className="max-w-2xl mx-auto w-full px-4">
            <div className="bg-card p-4 rounded-lg w-full min-h-[120px]">
              <h2 className="text-xl font-bold mb-2">{currentStep.title}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: currentStep.content }}
                className="text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Grid or content area */}
        <div className="w-full grid place-items-center py-4">
          <div className="max-w-2xl w-full px-4">
            {showGrid ? (
              <TutorialGridWrapper
                tutorialGrid={grid}
                onCellClick={handleCellClick}
                helpText=""
              />
            ) : isLastStep ? (
              <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Link href="/game/zen">
                    <Button size="lg" className="px-8 w-full">Zen Mode</Button>
                  </Link>
                  <Link href="/game/classic">
                    <Button size="lg" className="px-8 w-full">Classic Mode</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="aspect-square w-full max-h-[300px]" aria-hidden="true"></div>
            )}
          </div>
        </div>
      </main>

      {/* Navigation buttons - fixed at bottom */}
      <footer className="w-full py-8">
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto px-4">
          <Button
            onClick={prevStep}
            disabled={step === 0}
            className="grid grid-flow-col gap-2 bg-background text-foreground border-2 border-foreground rounded-lg"
          >
            <ChevronLeft size={18} />
            Previous
          </Button>

          <Button
            onClick={nextStep}
            className="grid grid-flow-col gap-2 bg-foreground text-background rounded-lg"
          >
            Next
            <ChevronRight size={18} />
          </Button>
        </div>
      </footer>
    </div>
  );
}