'use client';

import { useState, useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { useGame } from '@/contexts/GameContext';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Volume2, VolumeX, Home } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const {
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    playIfPossible,
  } = useAudio();
  const { animationsEnabled, toggleAnimations } = useGame();
  const [displayVolume, setDisplayVolume] = useState(Math.round(volume * 100));
  const [prevVolume, setPrevVolume] = useState(volume > 0 ? volume : 0.5); // Track previous volume for mute toggle
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update the display volume when the actual volume changes
  useEffect(() => {
    setDisplayVolume(Math.round(volume * 100));
  }, [volume]);

  // Set initial muted state when component mounts
  useEffect(() => {
    // Start with audio muted
    if (!isMuted) {
      setIsMuted(true);
    }
  }, [isMuted, setIsMuted]);

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];

    // Remember the previous non-zero volume for mute toggle
    if (newVolume > 0) {
      setPrevVolume(newVolume);
    }

    // If we're changing from 0 to a positive value, unmute
    if (volume === 0 && newVolume > 0) {
      setIsMuted(false);
    }

    // If we're muted and changing to a positive value, unmute
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }

    setVolume(newVolume);

    // If we now have a positive volume and we're not muted, try to play
    if (newVolume > 0 && !isMuted) {
      playIfPossible();
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      // Unmuting - restore previous volume if current is 0
      if (volume === 0) {
        setVolume(prevVolume);
      }
      setIsMuted(false);

      // Try to play if we have volume
      if (volume > 0 || prevVolume > 0) {
        playIfPossible();
      }
    } else {
      // Muting - remember current volume if it's > 0
      if (volume > 0) {
        setPrevVolume(volume);
      }
      setIsMuted(true);
    }
  };

  // Don't render until client-side to prevent hydration mismatch with animation toggle
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full flex-shrink-0">
        <div className="container h-full p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
          <Link href="/">
            <Button variant="outline" className="grid place-items-center border-foreground w-[48px] h-[48px] p-0 min-w-0">
              <Home size={42} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-center">Settings</h1>
          {/* Spacer for alignment */}
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full flex flex-col max-w-md space-y-8">

          {/* Animations Setting */}
          <div className="flex flex-col space-y-4">
            <div
              className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={toggleAnimations}
              role="button"
              tabIndex={0}
              aria-pressed={animationsEnabled}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleAnimations();
                }
              }}
            >
              <div>
                <h3 className="text-base font-medium">Animations</h3>
                <p className="text-sm text-muted-foreground">
                  Enable or disable game animations
                </p>
              </div>
              <Switch
                checked={animationsEnabled}
                onCheckedChange={() => {
                  // This prevents the switch from handling the click twice
                  // The parent div's onClick will handle the toggle
                }}
                onClick={(e) => {
                  // Stop propagation to prevent double toggling
                  e.stopPropagation();
                }}
                aria-label="Toggle animations"
              />
            </div>
          </div>

          {/* Music Volume Setting */}
          <div className="flex flex-col space-y-4">
            <div
              className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={handleMuteToggle}
              role="button"
              tabIndex={0}
              aria-pressed={!isMuted}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleMuteToggle();
                }
              }}
            >
              <div>
                <h3 className="text-base font-medium">Music Volume</h3>
                <p className="text-sm text-muted-foreground">
                  Adjust background music volume
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    // Stop propagation to prevent double toggling
                    e.stopPropagation();
                    handleMuteToggle();
                  }}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm font-medium min-w-[40px] text-right">
                  {isMuted ? "Muted" : `${displayVolume}%`}
                </span>
              </div>
            </div>

            <div className="px-4">
              <Slider
                defaultValue={[volume]}
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                aria-label="Music Volume"
                className={`py-2 ${isMuted ? "opacity-50" : ""}`}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
} 