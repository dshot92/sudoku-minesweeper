import SudokuMinesweeper from "@/components/sudoku-minesweeper";

export default function Home() {
  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 relative">
        <SudokuMinesweeper />
      </div>
    </main>
  );
}
