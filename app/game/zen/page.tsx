import Grid from "@/components/Grid";
import LateralMenu from "@/components/LateralMenu";

export default function ZenMode() {
  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 relative">
        <LateralMenu />
        <Grid />
      </div>
    </main>
  );
} 