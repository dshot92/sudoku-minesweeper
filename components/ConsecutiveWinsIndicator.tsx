import { useGame } from "@/contexts/GameContext";

export default function ConsecutiveWinsIndicator() {
  const {
    consecutiveWins,
    gameMode,
    maxConsecutiveWinsForProgression
  } = useGame();

  if (gameMode !== 'classic') {
    return null;
  }

  const css_win = 'bg-foreground';
  const css_loss = 'border-4 border-foreground bg-background';

  return (
    <div className="flex justify-center w-full">
      <div className="flex justify-center">
        {Array.from({ length: maxConsecutiveWinsForProgression }, (_, index) => (
          <div
            key={index}
            className={`w-10 h-10 m-2 rounded-full transition-all duration-300 
              ${index < consecutiveWins
                ? css_win
                : css_loss}`
            }
            title={`Win ${index + 1} of ${maxConsecutiveWinsForProgression}`}
          />
        ))}
      </div>
    </div>
  );
}