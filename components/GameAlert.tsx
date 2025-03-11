"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGame } from "@/contexts/GameContext"

export function GameAlert() {
  const { message } = useGame()

  return (
    <>
      {message && (
        <div
          className="fixed inset-x-0 pointer-events-none"
          style={{
            top: 'min(20%, 160px)',
          }}
        >
          <div className="max-w-xl mx-auto px-10">
            <Alert className="pointer-events-auto"
              style={{
                backgroundColor: 'var(--foreground)',
                color: 'var(--background)'
              }}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </>
  )
}