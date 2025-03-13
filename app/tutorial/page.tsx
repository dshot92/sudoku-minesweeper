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

export default function TutorialPage() {
  const [step, setStep] = useState(0);
  const [grid, setGrid] = useState<TutorialCellState[][]>([]);
  const [helpText, setHelpText] = useState<string>("");

  const tutorialSteps = [
    {
      title: "The Basics",
      content: "Each region contains numbers 1 through N (where N is the grid size). Each row and column also contains numbers 1 through N. Continue exploring the grid!",
      showGrid: true,
      gridGenerator: generateNumbersGrid,
      helpTextDefault: "Each row and column also contains numbers 1-4, just like Sudoku.",
    },
    {
      title: "The Mines",
      content: "Each colored region contains exactly one mine. The mine is always the highest number in that region. Notice that in this 4x4 grid, the number 4 is always a mine.",
      showGrid: true,
      gridGenerator: generateMinesGrid,
      helpTextDefault: "In each region, the number 4 is always a mine.",
    },
    {
      title: "Region Completion",
      content: "When you reveal all non-mine cells in a region, the mine is automatically revealed safely. Try clicking on the remaining unrevealed cells in the highlighted region.",
      showGrid: true,
      gridGenerator: generateRegionCompletionGrid,
      helpTextDefault: "When all non-mine cells in a region are revealed, the mine is automatically revealed safely.",
    },
    {
      title: "Winning the Game",
      content: "You win when all cells (including mines) are revealed. In Classic mode, win 3 times to progress to a larger grid! Try to reveal all cells to see what happens.",
      showGrid: true,
      gridGenerator: generateWinningGrid,
      helpTextDefault: "Try to reveal all cells to win the game!",
    },
    {
      title: "Ready to Play?",
      content: "You're now ready to play Sudoku Minesweeper! Choose Zen mode for a relaxed experience or Classic mode for a challenge.",
      showGrid: false,
      showButtons: true,
    },
  ];

  const currentStep = tutorialSteps[step];
  const isLastStep = step === tutorialSteps.length - 1;

  // Update grid when step changes
  useEffect(() => {
    if (currentStep.gridGenerator) {
      setGrid(currentStep.gridGenerator());
    }

    // Reset the help text to the default for this step
    setHelpText(currentStep.helpTextDefault || "");
  }, [step]);

  const handleCellClick = (row: number, col: number) => {
    // Don't allow interaction on steps that are just for display
    if (step === 2 || step === 5) return;

    // Don't allow clicking already revealed cells
    if (grid[row][col].revealed) return;

    const newGrid = JSON.parse(JSON.stringify(grid)); // Deep clone

    // Reveal the clicked cell
    newGrid[row][col].revealed = true;

    // If it's a mine, show a message
    if (newGrid[row][col].isMine) {
      setHelpText("You revealed a mine! In a real game, this would end the game.");
    }

    // Check if all non-mine cells in this component are revealed
    const componentId = newGrid[row][col].componentId;
    let allNonMinesInComponentRevealed = true;
    let minePosition: { row: number, col: number } | null = null;

    // Find all cells in this component
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (newGrid[r][c].componentId === componentId) {
          if (newGrid[r][c].isMine) {
            minePosition = { row: r, col: c };
          } else if (!newGrid[r][c].revealed) {
            allNonMinesInComponentRevealed = false;
          }
        }
      }
    }

    // If all non-mine cells in the component are revealed, reveal the mine too
    if (allNonMinesInComponentRevealed && minePosition) {
      newGrid[minePosition.row][minePosition.col].revealed = true;
      setHelpText("Great! You revealed all non-mine cells in this region, so the mine is automatically revealed safely.");
    }

    // Check if all cells are revealed (win condition)
    let allRevealed = true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!newGrid[r][c].revealed) {
          allRevealed = false;
          break;
        }
      }
    }

    if (allRevealed) {
      setHelpText("Congratulations! You've revealed all cells and won the game!");
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full h-[72px]">
        <div className="container h-full p-4 flex items-center">
          <div className="flex-1 flex justify-start">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 border-foreground">
                <Home size={18} />
              </Button>
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-bold">How to Play</h1>
          </div>
          <div className="flex-1 flex justify-end">
            {/* Spacer for alignment */}
            <div className="w-[40px]"></div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-between">
        {/* Top area - Instructions */}
        <div className="flex-1 flex items-center justify-center">
          {!isLastStep && (
            <div className="bg-card p-4 rounded-lg shadow-lg max-w-2xl w-full mx-auto min-h-[120px] flex flex-col justify-center">
              <h2 className="text-xl font-bold mb-2">{currentStep.title}</h2>
              <p className="text-muted-foreground">{currentStep.content}</p>
            </div>
          )}
        </div>

        {/* Middle area - Grid or Ready to Play */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full mx-auto">
            {isLastStep ? (
              <div className="w-full aspect-square flex flex-col items-center justify-center bg-card rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">{tutorialSteps[tutorialSteps.length - 1].title}</h2>
                <p className="text-muted-foreground text-center mb-8 px-8">{tutorialSteps[tutorialSteps.length - 1].content}</p>

                <div className="flex gap-6 justify-center">
                  <Link href="/game/zen">
                    <Button size="lg" className="px-8">Zen Mode</Button>
                  </Link>
                  <Link href="/game/classic">
                    <Button size="lg" className="px-8">Classic Mode</Button>
                  </Link>
                </div>
              </div>
            ) : currentStep.showGrid ? (
              <TutorialGridWrapper
                tutorialGrid={grid}
                onCellClick={handleCellClick}
                helpText={helpText}
              />
            ) : (
              <div className="text-muted-foreground text-center">
                {step === 0 ? "Welcome to Sudoku Minesweeper!" : "Let's play!"}
              </div>
            )}
          </div>
        </div>

        {/* Bottom area - Navigation buttons */}
        <div className="flex-1 px-2 flex items-center justify-center">
          {!isLastStep && (
            <div className="flex justify-between w-full max-w-md mx-auto">
              <Button
                onClick={prevStep}
                disabled={step === 0}
                variant="outline"
                className="flex items-center gap-2 border-foreground"
              >
                <ChevronLeft size={18} />
                Previous
              </Button>

              <Button
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 