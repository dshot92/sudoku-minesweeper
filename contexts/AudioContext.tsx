'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

interface AudioContextType {
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  playIfPossible: () => boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [volume, setVolume] = useState(0.5); // Default volume at 50%
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/music/background.mp3');
      audio.loop = true;
      audio.volume = volume;

      // Set up event listeners
      audio.addEventListener('canplaythrough', () => {
        setAudioLoaded(true);
        // console.log('Audio loaded and ready to play');
      });

      audio.addEventListener('play', () => {
        // console.log('Audio started playing');
        setIsPlaying(true);
      });

      audio.addEventListener('pause', () => {
        // console.log('Audio paused');
        // Only update isPlaying if we're not in the middle of a volume change
        if (audio.volume > 0 && !isMuted) {
          setIsPlaying(false);
        }
      });

      audio.addEventListener('error', (e) => {
        // console.error('Audio error:', e);
        setIsPlaying(false);
      });

      audioRef.current = audio;

      // Clean up on unmount
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.remove();
          audioRef.current = null;
        }
      };
    }
  }, []);

  // Update audio volume when volume or mute state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;

      // If volume is 0 or muted, pause the audio
      if ((volume === 0 || isMuted) && isPlaying) {
        audioRef.current.pause();
      }

      // If we have volume, not muted, and should be playing, try to play
      if (volume > 0 && !isMuted && isPlaying && audioLoaded) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing audio after volume change:', error);
          });
        }
      }
    }
  }, [volume, isMuted, isPlaying, audioLoaded]);

  // Function to play audio if conditions allow
  const playIfPossible = () => {
    if (!audioRef.current || !audioLoaded) return false;

    if (volume > 0 && !isMuted) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Successfully started playback');
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('Error in playIfPossible:', error);
            // Most likely a user interaction is needed for autoplay
            setIsPlaying(false);
          });
      }
      return true;
    }
    return false;
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioLoaded) return;

    if (isPlaying) {
      audioRef.current.pause();
      // setIsPlaying will be updated by the pause event listener
    } else if (volume > 0 && !isMuted) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error in togglePlay:', error);
          setIsPlaying(false);
        });
      }
      // setIsPlaying will be updated by the play event listener
    }
  };

  return (
    <AudioContext.Provider value={{
      volume,
      setVolume,
      isMuted,
      setIsMuted,
      toggleMute,
      isPlaying,
      setIsPlaying,
      togglePlay,
      playIfPossible
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
} 