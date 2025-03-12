import { useGame } from "@/contexts/GameContext";

export default function ConsecutiveWinsIndicator() {
  const {
    consecutiveWins,
    gameMode,
    maxConsecutiveWinsForProgression
  } = useGame();

  const css_win = 'bg-foreground';
  const css_loss = 'border-4 border-foreground bg-background';

  // Always render the component but control visibility with opacity instead of invisible
  return (
    <div className="w-full flex justify-center items-center">
      <div
        className="flex justify-center transition-opacity duration-300"
        style={{
          opacity: gameMode === 'classic' ? 1 : 0,
          marginTop: '0'
        }}
      >
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