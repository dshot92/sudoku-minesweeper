"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGame } from "@/contexts/GameContext"

export function GameAlert() {
  const { message } = useGame()

  return (
    <div className="w-full flex justify-center items-center">
      <Alert
        className={`pointer-events-auto max-w-xs ${!message ? 'hidden' : ''}`}
        style={{
          backgroundColor: 'var(--foreground)',
          color: 'var(--background)'
        }}
      >
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  )
}