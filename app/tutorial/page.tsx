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
      title: "Modes",
      content: "You can choose between Zen mode and Classic mode. Zen mode is a relaxed experience, while Classic mode is a challenge.",
      showGrid: false,
      showButtons: true,
    }, {
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
    <div className="min-h-screen bg-background grid grid-rows-[auto_1fr]">
      <header className="w-full">
        <div className="container h-full p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
          <Link href="/">
            <Button variant="outline" className="grid grid-flow-col gap-2 border-foreground">
              <Home size={18} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">How to Play</h1>
          {/* Spacer for alignment */}
          <div className="w-[40px]"></div>
        </div>
      </header>

      <div className="h-full grid grid-rows-[auto_1fr_auto] gap-4 px-4 pb-8 w-full">
        {/* Top area - Instructions */}
        <div className="max-w-2xl mx-auto w-full">
          {!isLastStep && (
            <div className="bg-card p-4 rounded-lg w-full grid content-start">
              <h2 className="text-xl font-bold mb-2">{currentStep.title}</h2>
              <p className="text-muted-foreground">{currentStep.content}</p>
            </div>
          )}
        </div>

        {/* Middle area - Grid or Ready to Play */}
        <div className="grid place-items-center w-full">
          <div className="max-w-2xl w-full">
            {isLastStep ? (
              <div className="bg-card p-4 rounded-lg w-full grid content-start gap-4">
                <h2 className="text-2xl font-bold">{tutorialSteps[tutorialSteps.length - 1].title}</h2>
                <p className="text-muted-foreground">{tutorialSteps[tutorialSteps.length - 1].content}</p>

                <div className="grid grid-cols-2 gap-6">
                  <Link href="/game/zen">
                    <Button size="lg" className="px-8 w-full">Zen Mode</Button>
                  </Link>
                  <Link href="/game/classic">
                    <Button size="lg" className="px-8 w-full">Classic Mode</Button>
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
              <></>
            )}
          </div>
        </div>

        {/* Bottom area - Navigation buttons */}
        <div className="w-full">
          {!isLastStep && (
            <div className="grid grid-cols-[200px_200px] gap-4 mx-auto w-fit">
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
          )}
        </div>
      </div>
    </div>
  );
} 