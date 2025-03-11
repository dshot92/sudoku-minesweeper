"use client"

import { CellState } from "@/lib/sudoku-minesweeper"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

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
}

export function Cell({ cell, onClick, gridSize }: CellProps) {
  const { theme } = useTheme()
  const [mutedColor, setMutedColor] = useState('')
  const [originalColor, setOriginalColor] = useState('')

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

  return (
    <div
      className="flex items-center justify-center rounded-sm border border-background aspect-square transition-colors duration-200"
      style={{
        backgroundColor: cell.revealed ? mutedColor : originalColor,
      }}
      onClick={onClick}
    >
      {cell.revealed && (
        cell.value === gridSize ? (
          <div
            style={{
              width: '42px',
              height: '42px',
              WebkitMask: 'url("/mine.svg") center/contain no-repeat',
              mask: 'url("/mine.svg") center/contain no-repeat',
              backgroundColor: originalColor
            }}
          />
        ) : (
          <span
            style={{
              color: originalColor,
              fontSize: '42px',
              lineHeight: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px'
            }}
          >
            {cell.value}
          </span>
        )
      )}
    </div>
  )
} 