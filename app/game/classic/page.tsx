import LateralMenu from "@/components/LateralMenu";

export default function ClassicMode() {
  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 relative">
        <LateralMenu />
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h1 className="text-3xl font-bold mb-4">Classic Mode</h1>
          <p className="text-lg text-muted-foreground">Coming Soon!</p>
          <p className="text-sm text-muted-foreground mt-2">
            This mode will feature time limits and scoring
          </p>
        </div>
      </div>
    </main>
  );
} 