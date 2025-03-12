"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGame } from "@/contexts/GameContext"

export function GameAlert() {
  const { message } = useGame()

  return (
    <div className="w-full flex justify-center items-center">
      <Alert
        className={`pointer-events-auto max-w-xs min-h-[50px] ${!message ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundColor: 'var(--foreground)',
          color: 'var(--background)',
          transition: 'opacity 0.2s ease-in-out',
          marginBottom: '0'
        }}
      >
        <AlertDescription>{message || "Game message will appear here"}</AlertDescription>
      </Alert>
    </div>
  )
}