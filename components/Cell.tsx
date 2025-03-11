import { CellState } from "@/lib/sudoku-minesweeper"

// Convert CSS variable to RGB
const cssVarToRGB = (componentId: number) => {
  const color = getComputedStyle(document.documentElement).getPropertyValue(`--component-color-${componentId}`).trim()
  const hex = color.startsWith('#') ? color : `#${color}`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

// Create a muted version of a color based on the current theme
const getMutedColor = (componentId: number) => {
  const { r, g, b } = cssVarToRGB(componentId)
  const isDarkMode = document.documentElement.classList.contains('dark')

  // In dark mode, mix with black; in light mode, mix with white
  const muteFactor = 0.8
  if (isDarkMode) {
    const mutedR = Math.round(r * (1 - muteFactor))
    const mutedG = Math.round(g * (1 - muteFactor))
    const mutedB = Math.round(b * (1 - muteFactor))
    return `rgb(${mutedR}, ${mutedG}, ${mutedB})`
  } else {
    const mutedR = Math.round(r + (255 - r) * muteFactor)
    const mutedG = Math.round(g + (255 - g) * muteFactor)
    const mutedB = Math.round(b + (255 - b) * muteFactor)
    return `rgb(${mutedR}, ${mutedG}, ${mutedB})`
  }
}

interface CellProps {
  cell: CellState
  onClick: () => void
  gridSize: number
}

export function Cell({ cell, onClick, gridSize }: CellProps) {
  const originalColor = `var(--component-color-${cell.componentId})`
  const mutedColor = getMutedColor(cell.componentId)

  return (
    <div
      className="flex items-center justify-center aspect-square border transition-colors duration-200"
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