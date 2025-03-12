"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGame } from "@/contexts/GameContext"

export function GameAlert() {
  const { message } = useGame()

  return (
    <div
      className={`flex max-w-xs mx-auto p-10 justify-center items-center pointer-events-none ${!message ? 'hidden' : ''}`}
    >
      <Alert
        className="pointer-events-auto"
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