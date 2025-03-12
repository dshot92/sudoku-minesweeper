import { useGame } from "@/contexts/GameContext";

export default function ConsecutiveWinsIndicator() {
  const { consecutiveWins, gameMode } = useGame();

  // Only render if in classic mode
  if (gameMode !== 'classic') {
    return null;
  }

  const css_win = 'bg-foreground';
  const css_loss = 'border-4 border-foreground bg-background';

  return (
    <div className="flex flex-1 pt-0 mt-0 justify-center">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={` w-10 h-10 m-2 rounded-full 
             ${index < consecutiveWins ? css_win : css_loss}`}
        />
      ))}
    </div>
  );
}