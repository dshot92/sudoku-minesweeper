'use client';

import LateralMenu from "@/components/LateralMenu";
import { GameProvider } from "@/contexts/GameContext";
import NewGameButton from "@/components/NewGameButton";
import { GameAlert } from "@/components/GameAlert";
import { HintButton } from "@/components/HintButton";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GameProvider>
      <GameLayoutContent>{children}</GameLayoutContent>
    </GameProvider>
  );
}

function GameLayoutContent({ children, }: { children: React.ReactNode; }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full">
        <div className="container mx-auto p-4 flex items-center">
          <div className="flex-1 flex justify-start">
            <LateralMenu />
          </div>
          <div className="flex-1 flex justify-center">
            <NewGameButton />
          </div>
          <div className="flex-1 flex justify-end">
            <HintButton />
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-col px-2">
        <GameAlert />
        {children}
      </div>
    </div>
  );
}

