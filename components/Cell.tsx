"use client"

import { CellState } from "@/lib/sudoku-minesweeper"
import { useTheme } from "next-themes"
import { useEffect, useState, useRef } from "react"

// Move color conversion logic outside component
const hexToRGB = (hex: string) => {
  const h = hex.startsWith('#') ? hex : `#${hex}`
  const r = parseInt(h.slice(1, 3), 16)
  const g = parseInt(h.slice(3, 5), 16)
  const b = parseInt(h.slice(5, 7), 16)
  return { r, g, b }
}

interface CellProps {
  cell: CellState
  onClick: () => void
  gridSize: number
  isNewGrid?: boolean
  gameWon?: boolean
  gameLost?: boolean
  rowIndex?: number
  colIndex?: number
}

export function Cell({
  cell,
  onClick,
  gridSize,
  isNewGrid = false,
  gameWon = false,
  gameLost = false,
  rowIndex = 0,
  colIndex = 0
}: CellProps) {
  const { theme } = useTheme()
  const [mutedColor, setMutedColor] = useState('')
  const [originalColor, setOriginalColor] = useState('')
  const [winAnimation, setWinAnimation] = useState(false)
  const [loseAnimation, setLoseAnimation] = useState(false)
  const prevGameWonRef = useRef(gameWon)
  const prevGameLostRef = useRef(gameLost)

  // Calculate animation delays based on position
  const newGridDelay = `${(rowIndex + colIndex) * 30}ms`
  const winAnimationDelay = `${(rowIndex + colIndex) * 20}ms`
  const loseAnimationDelay = `${(rowIndex + colIndex) * 15}ms`

  // Define animation durations
  const colorTransitionDuration = '200ms'
  const appearAnimationDuration = '600ms'
  const winAnimationDuration = '500ms'
  const loseAnimationDuration = '400ms'

  useEffect(() => {
    // Get the CSS variable value
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(`--component-color-${cell.componentId}`)
      .trim()

    const { r, g, b } = hexToRGB(color)
    const isDark = theme === 'dark'

    // Calculate muted color based on theme
    const muteFactor = 0.8
    const mutedRGB = isDark
      ? {
        r: Math.round(r * (1 - muteFactor)),
        g: Math.round(g * (1 - muteFactor)),
        b: Math.round(b * (1 - muteFactor))
      }
      : {
        r: Math.round(r + (255 - r) * muteFactor),
        g: Math.round(g + (255 - g) * muteFactor),
        b: Math.round(b + (255 - b) * muteFactor)
      }

    setOriginalColor(`var(--component-color-${cell.componentId})`)
    setMutedColor(`rgb(${mutedRGB.r}, ${mutedRGB.g}, ${mutedRGB.b})`)
  }, [cell.componentId, theme]) // Re-calculate when theme changes

  // Handle win animation - only trigger when gameWon changes from false to true
  useEffect(() => {
    if (gameWon && !prevGameWonRef.current) {
      setWinAnimation(true)
      const timer = setTimeout(() => {
        setWinAnimation(false)
      }, 800)
      return () => clearTimeout(timer)
    }
    prevGameWonRef.current = gameWon
  }, [gameWon])

  // Handle lose animation - only trigger when gameLost changes from false to true
  useEffect(() => {
    if (gameLost && !prevGameLostRef.current) {
      setLoseAnimation(true)
      const timer = setTimeout(() => {
        setLoseAnimation(false)
      }, 600) // Shorter duration for lose animation
      return () => clearTimeout(timer)
    }
    prevGameLostRef.current = gameLost
  }, [gameLost])

  return (
    <div
      className={`
        flex items-center justify-center rounded-sm border border-background aspect-square
        ${isNewGrid ? 'animate-cell-appear' : ''}
        ${winAnimation ? 'animate-cell-win' : ''}
        ${loseAnimation ? 'animate-cell-lose' : ''}
      `}
      style={{
        backgroundColor: cell.revealed ? mutedColor : originalColor,
        animationDelay: isNewGrid
          ? newGridDelay
          : winAnimation
            ? winAnimationDelay
            : loseAnimation
              ? loseAnimationDelay
              : '0ms',
        animationDuration: isNewGrid
          ? appearAnimationDuration
          : winAnimation
            ? winAnimationDuration
            : loseAnimation
              ? loseAnimationDuration
              : '0ms',
        transition: `background-color ${colorTransitionDuration}`,
      }}
      onClick={onClick}
    >
      {cell.revealed && (
        cell.value === gridSize ? (
          // Show flag for auto-revealed mines, show mine for directly clicked mines
          cell.isFlag ? (
            <div
              style={{
                width: '36px',
                height: '36px',
                WebkitMask: 'url("/flag.svg") center/contain no-repeat',
                mask: 'url("/flag.svg") center/contain no-repeat',
                backgroundColor: originalColor
              }}
            />
          ) : (
            <div
              style={{
                width: '36px',
                height: '36px',
                WebkitMask: 'url("/mine.svg") center/contain no-repeat',
                mask: 'url("/mine.svg") center/contain no-repeat',
                backgroundColor: originalColor
              }}
            />
          )
        ) : (
          <span
            style={{
              color: originalColor,
              fontSize: '36px',
              lineHeight: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px'
            }}
          >
            {cell.value}
          </span>
        )
      )}
    </div>
  )
} 