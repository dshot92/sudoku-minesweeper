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
  // generateRegionCompletionGrid,
  generateWinningGrid
} from '@/lib/tutorialGridGenerator';

// Helper function to convert markdown-style bold to HTML
const convertMarkdownBold = (text: string) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

// Tutorial Step Components
const TutorialStep1 = ({ 
  grid, 
  helpText, 
  onCellClick 
}: { 
  grid: TutorialCellState[][], 
  helpText: string, 
  onCellClick: (row: number, col: number) => void 
}) => (
  <>
    <div className="max-w-2xl mx-auto w-full px-4">
      <div className="bg-card p-4 rounded-lg w-full min-h-[120px] flex flex-col justify-center">
        <h2 className="text-xl font-bold mb-2">The Basics</h2>
        <div className="text-foreground">
          Each region contains numbers 1 through N (where N is the grid size). Each row and column also contains numbers 1 through N. These cells show how numbers <strong>can't repeat in rows or columns</strong>. Try revealing more cells!
        </div>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center w-full relative">
      <div className="max-w-2xl w-full px-4">
        <TutorialGridWrapper
          tutorialGrid={grid}
          onCellClick={onCellClick}
          helpText={helpText}
        />
      </div>
    </div>
  </>
);

const TutorialStep2 = ({ 
  grid, 
  helpText, 
  onCellClick 
}: { 
  grid: TutorialCellState[][], 
  helpText: string, 
  onCellClick: (row: number, col: number) => void 
}) => (
  <>
    <div className="max-w-2xl mx-auto w-full px-4">
      <div className="bg-card p-4 rounded-lg w-full min-h-[120px] flex flex-col justify-center">
        <h2 className="text-xl font-bold mb-2">The Mines</h2>
        <div className="text-foreground">
          Each colored region contains <strong>exactly one mine</strong>. The mine is always the <strong>highest number</strong> in that region. These cells show the mines - notice they're always the number 4 in a 4x4 grid. Try revealing more cells!
        </div>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center w-full relative">
      <div className="max-w-2xl w-full px-4">
        <TutorialGridWrapper
          tutorialGrid={grid}
          onCellClick={onCellClick}
          helpText={helpText}
        />
      </div>
    </div>
  </>
);

const TutorialStep3 = ({ 
  grid, 
  helpText, 
  onCellClick 
}: { 
  grid: TutorialCellState[][], 
  helpText: string, 
  onCellClick: (row: number, col: number) => void 
}) => (
  <>
    <div className="max-w-2xl mx-auto w-full px-4">
      <div className="bg-card p-4 rounded-lg w-full min-h-[120px] flex flex-col justify-center">
        <h2 className="text-xl font-bold mb-2">Region Completion</h2>
        <div className="text-foreground">
          When you reveal all <strong>non-mine cells</strong> in a region, the mine is <strong>automatically revealed safely</strong>. This is a key strategy! In this example, try revealing the remaining non-mine cells to see the mine auto-reveal.
        </div>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center w-full relative">
      <div className="max-w-2xl w-full px-4">
        <TutorialGridWrapper
          tutorialGrid={grid}
          onCellClick={onCellClick}
          helpText={helpText}
        />
      </div>
    </div>
  </>
);

const TutorialStep4 = ({ 
  grid, 
  helpText, 
  onCellClick 
}: { 
  grid: TutorialCellState[][], 
  helpText: string, 
  onCellClick: (row: number, col: number) => void 
}) => (
  <>
    <div className="max-w-2xl mx-auto w-full px-4">
      <div className="bg-card p-4 rounded-lg w-full min-h-[120px] flex flex-col justify-center">
        <h2 className="text-xl font-bold mb-2">Using Rows and Columns</h2>
        <div className="text-foreground">
          <p>Completed rows and columns can help you identify what numbers are missing in other regions. If a row has numbers 1, 2, and 3 revealed, then any unrevealed cell in that row must be 4 (in a 4x4 grid).</p>
          <p className="mt-2">Try revealing cells to complete rows and columns!</p>
        </div>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center w-full relative">
      <div className="max-w-2xl w-full px-4">
        <TutorialGridWrapper
          tutorialGrid={grid}
          onCellClick={onCellClick}
          helpText={helpText}
        />
      </div>
    </div>
  </>
);

const TutorialStep5 = ({ 
  grid, 
  helpText, 
  onCellClick 
}: { 
  grid: TutorialCellState[][], 
  helpText: string, 
  onCellClick: (row: number, col: number) => void 
}) => (
  <>
    <div className="max-w-2xl mx-auto w-full px-4">
      <div className="bg-card p-4 rounded-lg w-full min-h-[120px] flex flex-col justify-center">
        <h2 className="text-xl font-bold mb-2">Cross-Region Deduction</h2>
        <div className="text-foreground">
          <p>When a cell could be multiple values, look at how it relates to other regions. If a cell in region A could be 2 or 3, but region B already has a 3 in the same row, then the cell in region A must be 2.</p>
          <p className="mt-2">This grid shows a situation where cross-region deduction helps. Try to solve it!</p>
        </div>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center w-full relative">
      <div className="max-w-2xl w-full px-4">
        <TutorialGridWrapper
          tutorialGrid={grid}
          onCellClick={onCellClick}
          helpText={helpText}
        />
      </div>
    </div>
  </>
);

const TutorialStep6 = ({ 
  grid, 
  helpText, 
  onCellClick 
}: { 
  grid: TutorialCellState[][], 
  helpText: string, 
  onCellClick: (row: number, col: number) => void 
}) => (
  <>
    <div className="max-w-2xl mx-auto w-full px-4">
      <div className="bg-card p-4 rounded-lg w-full min-h-[120px] flex flex-col justify-center">
        <h2 className="text-xl font-bold mb-2">Mine Safety</h2>
        <div className="text-foreground">
          <p>Remember, clicking on a mine <strong>doesn't end the game</strong>, but it's more efficient to reveal them through region completion!</p>
          <p className="mt-2">Try revealing all cells in this grid to win, using the strategies you've learned.</p>
        </div>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center w-full relative">
      <div className="max-w-2xl w-full px-4">
        <TutorialGridWrapper
          tutorialGrid={grid}
          onCellClick={onCellClick}
          helpText={helpText}
        />
      </div>
    </div>
  </>
);

const TutorialStep7 = ({ 
  grid, 
  helpText, 
  onCellClick 
}: { 
  grid: TutorialCellState[][], 
  helpText: string, 
  onCellClick: (row: number, col: number) => void 
}) => (
  <>
    <div className="max-w-2xl mx-auto w-full px-4">
      <div className="bg-card p-4 rounded-lg w-full min-h-[120px] flex flex-col justify-center">
        <h2 className="text-xl font-bold mb-2">Winning the Game</h2>
        <div className="text-foreground">
          You win when <strong>all cells</strong> (including mines) are revealed. Some cells are already revealed to get you started - try to reveal the rest! Remember the rules you've learned about mines and regions.
        </div>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center w-full relative">
      <div className="max-w-2xl w-full px-4">
        <TutorialGridWrapper
          tutorialGrid={grid}
          onCellClick={onCellClick}
          helpText={helpText}
        />
      </div>
    </div>
  </>
);

const TutorialStep8 = () => (
  <>
    <div className="max-w-2xl mx-auto w-full px-4">
      <div className="bg-card p-4 rounded-lg w-full min-h-[120px] flex flex-col justify-center">
        <h2 className="text-xl font-bold mb-2">Game Modes</h2>
        <div className="text-foreground">
          <h3 className="text-foreground font-bold text-lg">Zen Mode</h3>
          <p className="text-foreground">
            <strong>Unlimited puzzles, zero stress.</strong> <span className="font-semibold">Jump between grid sizes</span>, experiment freely, and play at your own pace. 
      No tracking, no pressure - just pure puzzle solving.
    </p>
    <br />
          <h3 className="text-foreground font-bold text-lg">Classic Mode</h3>
          <p className="text-foreground">
            <strong>A true test of skill.</strong> <span className="font-semibold">Start at 4×4 and climb the grid sizes</span>. 
      Win <strong>3 games in a row</strong> to level up. New Game doesn't count against you - so push your limits without fear.
    </p>
        </div>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center w-full relative">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
        {/* Game mode buttons will be shown in the final step */}
      </div>
    </div>
  </>
);

const TutorialStep9 = () => (
  <>
    <div className="max-w-2xl mx-auto w-full px-4">
      <div className="bg-card p-4 rounded-lg w-full min-h-[120px] flex flex-col justify-center">
        <h2 className="text-xl font-bold mb-2">Ready to Play?</h2>
        <div className="text-foreground">
          Choose a game mode to start playing!
        </div>
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center w-full relative">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <Link href="/game/zen">
            <Button size="lg" className="px-8 w-full">Zen Mode</Button>
          </Link>
          <Link href="/game/classic">
            <Button size="lg" className="px-8 w-full">Classic Mode</Button>
          </Link>
        </div>
      </div>
    </div>
  </>
);

// Mock function for region completion grid - you'll need to implement this
const generateRegionCompletionGrid = () => {
  // This should generate a grid where a region is almost complete,
  // missing just one or two non-mine cells
  // For now, using the mines grid as a placeholder
  return generateMinesGrid();
};

// Mock function for rows and columns grid
const generateRowsColumnsGrid = () => {
  // This should generate a grid where completing rows/columns helps with deduction
  // For now, using the mines grid as a placeholder
  return generateMinesGrid();
};

// Mock function for cross-region deduction grid
const generateCrossRegionGrid = () => {
  // This should generate a grid where cross-region deduction is useful
  // For now, using the mines grid as a placeholder
  return generateMinesGrid();
};

// Mock function for mine safety grid
const generateMineSafetyGrid = () => {
  // This should generate a grid focused on mine safety
  // For now, using the mines grid as a placeholder
  return generateMinesGrid();
};

// Map of step index to grid generator functions
const stepGridGenerators = {
  0: generateNumbersGrid,
  1: generateMinesGrid,
  2: generateRegionCompletionGrid,
  3: generateRowsColumnsGrid,
  4: generateCrossRegionGrid,
  5: generateMineSafetyGrid,
  6: generateWinningGrid,
};

// Map of step index to default help text
const stepDefaultHelpText = {
  0: "Click on unrevealed cells to discover more numbers. Notice how each number appears exactly once in each row and column.",
  1: "Click on unrevealed cells in the partially revealed regions to see how numbers work with mines.",
  2: "Reveal the remaining non-mine cells in the highlighted region to see the mine auto-reveal!",
  3: "Try to identify which numbers are missing in each row and column to determine what cells contain.",
  4: "Look for relationships between regions to determine cell values.",
  5: "Practice revealing mines safely through region completion.",
  6: "Use what you've learned about mines and regions to reveal all cells safely!",
};

export default function TutorialPage() {
  const [step, setStep] = useState(0);
  const [grid, setGrid] = useState<TutorialCellState[][]>([]);
  const [helpText, setHelpText] = useState<string>("");
  const [previousGrid, setPreviousGrid] = useState<TutorialCellState[][]>([]);
  const [mineClicked, setMineClicked] = useState(false);

  const totalSteps = 9; // Update this if you add or remove steps
  const isLastStep = step === totalSteps - 1;

  // Handle browser back button
  useEffect(() => {
    // Initialize history state with current step
    window.history.replaceState({ step: step }, '');

    // Handle popstate event (back/forward buttons)
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && typeof event.state.step === 'number') {
        setStep(event.state.step);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [step]);

  // Update history when step changes
  useEffect(() => {
    // Don't push state on initial render
    if (typeof window !== 'undefined' && window.history.state && window.history.state.step !== step) {
      window.history.pushState({ step: step }, '');
    }
  }, [step]);

  // Update grid when step changes
  useEffect(() => {
    const gridGenerator = stepGridGenerators[step as keyof typeof stepGridGenerators];

    if (gridGenerator) {
      const newGrid = gridGenerator();
      setGrid(newGrid);
      setPreviousGrid(newGrid);
      setMineClicked(false);
    }

    // Reset the help text to the default for this step
    setHelpText(stepDefaultHelpText[step as keyof typeof stepDefaultHelpText] || "");
  }, [step]); // Only step is needed as a dependency

  const handleCellClick = (row: number, col: number) => {
    // Don't allow interaction on steps that don't need it
    if (step >= 7) return;

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

    // If this is step 2 (region completion), check if all non-mine cells are revealed
    // and auto-reveal the mine (simplified logic for the tutorial)
    if (step === 2) {
      const allNonMineRevealed = newGrid.every((row: TutorialCellState[]) => 
        row.every((cell: TutorialCellState) => cell.revealed || cell.isMine)
      );
      
      if (allNonMineRevealed) {
        // Auto-reveal all mines
        newGrid.forEach((row: TutorialCellState[]) => 
          row.forEach((cell: TutorialCellState) => {
            if (cell.isMine) cell.revealed = true;
          })
        );
      }
    }

    setGrid(newGrid);
  };

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Render the appropriate step component based on current step
  const renderCurrentStep = () => {
    switch (step) {
      case 0:
        return <TutorialStep1 grid={grid} helpText={helpText} onCellClick={handleCellClick} />;
      case 1:
        return <TutorialStep2 grid={grid} helpText={helpText} onCellClick={handleCellClick} />;
      case 2:
        return <TutorialStep3 grid={grid} helpText={helpText} onCellClick={handleCellClick} />;
      case 3:
        return <TutorialStep4 grid={grid} helpText={helpText} onCellClick={handleCellClick} />;
      case 4:
        return <TutorialStep5 grid={grid} helpText={helpText} onCellClick={handleCellClick} />;
      case 5:
        return <TutorialStep6 grid={grid} helpText={helpText} onCellClick={handleCellClick} />;
      case 6:
        return <TutorialStep7 grid={grid} helpText={helpText} onCellClick={handleCellClick} />;
      case 7:
        return <TutorialStep8 />;
      case 8:
        return <TutorialStep9 />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col overflow-x-hidden">
      <header className="w-full flex-shrink-0">
        <div className="container h-full p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
          <Link href="/">
            <Button variant="outline" className="grid place-items-center border-foreground w-[48px] h-[48px] p-0 min-w-0">
              <Home size={42} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-center">How to Play</h1>
          {/* Spacer for alignment */}
          <div className="w-10"></div>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Render the current step */}
        {renderCurrentStep()}

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

            {!isLastStep && (
              <Button
                onClick={nextStep}
                className="grid grid-flow-col gap-2 bg-foreground text-background rounded-lg"
              >
                Next
                <ChevronRight size={18} />
              </Button>
            )}
            {isLastStep && (
              <div></div> // Empty div to maintain grid layout
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}