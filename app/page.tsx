import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-4xl font-bold text-center mb-12">Sudoku Minesweeper</h1>
        <div className="space-y-4">
          <Link href="/game/zen"
            className="block w-full p-4 text-center bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors">
            Zen Mode
          </Link>
          <Link href="/game/classic"
            className="block w-full p-4 text-center bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors">
            Classic Mode
          </Link>
        </div>
      </div>
    </main>
  );
} 