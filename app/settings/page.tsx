'use client';

import { useState, useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Home } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const {
    volume,
    setVolume,
    isPlaying,
    isMuted,
    setIsMuted,
    playIfPossible,
  } = useAudio();
  const [displayVolume, setDisplayVolume] = useState(Math.round(volume * 100));
  const [prevVolume, setPrevVolume] = useState(volume > 0 ? volume : 0.5); // Track previous volume for mute toggle

  // Update the display volume when the actual volume changes
  useEffect(() => {
    setDisplayVolume(Math.round(volume * 100));
  }, [volume]);

  // Try to auto-play when component mounts if volume > 0 and not muted
  useEffect(() => {
    if (volume > 0 && !isMuted && !isPlaying) {
      // Use a timeout to ensure the audio context is ready
      const timer = setTimeout(() => {
        playIfPossible();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

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
        <div className="w-full max-w-md space-y-8">

          <div className="space-y-6 bg-card p-6 rounded-lg shadow-md">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Audio Settings</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Music Volume</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleMuteToggle}
                      className="h-8 w-8"
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
        </div>
      </main>
    </div>
  );
} 