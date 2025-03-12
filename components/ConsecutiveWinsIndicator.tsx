import { useGame } from "@/contexts/GameContext";

export default function ConsecutiveWinsIndicator() {
  const {
    consecutiveWins,
    gameMode,
    maxConsecutiveWinsForProgression
  } = useGame();

  const css_win = 'bg-foreground';
  const css_loss = 'border-4 border-foreground bg-background';

  // Always return the component structure but with hidden class when not in classic mode
  return (
    <div className={`w-full flex justify-center items-center ${gameMode !== 'classic' ? 'invisible' : ''}`}>
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