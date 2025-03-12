'use client';

import LateralMenu from "@/components/LateralMenu";
import NewGameButton from "@/components/NewGameButton";
import { GameAlert } from "@/components/GameAlert";
import { HintButton } from "@/components/HintButton";
import ConsecutiveWinsIndicator from "@/components/ConsecutiveWinsIndicator";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full h-[72px]">
        <div className="container h-full mt-2 p-4 flex items-center">
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
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex-1 flex items-center justify-center">
          <GameAlert />
        </div>
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <ConsecutiveWinsIndicator />
        </div>
      </div>
    </div>
  );
}

