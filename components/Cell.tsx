import { CellState } from "@/lib/sudoku-minesweeper"

const COLORS = [
  "#FFD700", // bright yellow
  "#87CEEB", // sky blue
  "#90EE90", // light green
  "#FF3333", // bright red
  "#FF6B2B", // bright orange
  "#FFB6C1", // light pink
  "#20B2AA", // light sea green
  "#B8B8B8"  // medium gray
]

// Convert hex to RGB
const hexToRGB = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

// Create a muted version of a color
const getMutedColor = (hex: string) => {
  const { r, g, b } = hexToRGB(hex)
  // Mix with white to create a muted version
  const muteFactor = 0.8
  const mutedR = Math.round(r + (255 - r) * muteFactor)
  const mutedG = Math.round(g + (255 - g) * muteFactor)
  const mutedB = Math.round(b + (255 - b) * muteFactor)
  return `rgb(${mutedR}, ${mutedG}, ${mutedB})`
}

interface CellProps {
  cell: CellState
  onClick: () => void
  gridSize: number
}

export function Cell({ cell, onClick, gridSize }: CellProps) {
  const originalColor = COLORS[cell.componentId]
  const mutedColor = getMutedColor(originalColor)

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
          <span style={{ color: originalColor }}>
            {cell.value}
          </span>
        )
      )}
    </div>
  )
} 