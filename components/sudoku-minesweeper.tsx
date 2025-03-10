"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type CellState = {
  value: number
  revealed: boolean
  isMine: boolean
  componentId: number
}

export default function SudokuMinesweeper() {
  const [gridSize, setGridSize] = useState(9)
  const [inputSize, setInputSize] = useState("9")
  const [grid, setGrid] = useState<CellState[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [componentSize, setComponentSize] = useState(3)
  const [message, setMessage] = useState("")

  // Generate a solved grid
  const generateSolvedGrid = (size: number) => {
    // Calculate component size (sqrt of grid size)
    const compSize = Math.floor(Math.sqrt(size))
    if (compSize * compSize !== size) {
      setMessage(`Grid size must be a perfect square (e.g., 4, 9, 16, 25). Using ${compSize * compSize} instead.`)
      setGridSize(compSize * compSize)
      setInputSize(String(compSize * compSize))
      size = compSize * compSize
    } else {
      setMessage("")
    }

    setComponentSize(compSize)

    // Create a grid with sequential numbers in each component
    const newGrid: CellState[][] = Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({
            value: 0,
            revealed: false,
            isMine: false,
            componentId: 0,
          })),
      )

    // Assign component IDs and fill with values
    let componentId = 0
    for (let compRow = 0; compRow < compSize; compRow++) {
      for (let compCol = 0; compCol < compSize; compCol++) {
        // Calculate the starting position of this component
        const startRow = compRow * compSize
        const startCol = compCol * compSize

        // Generate values 1 to compSize^2 for this component
        const values = Array.from({ length: compSize * compSize }, (_, i) => i + 1)
        // Shuffle the values
        for (let i = values.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[values[i], values[j]] = [values[j], values[i]]
        }

        // Find the maximum value which will be a mine
        const maxValue = Math.max(...values)

        // Fill the component with values
        let valueIndex = 0
        for (let r = 0; r < compSize; r++) {
          for (let c = 0; c < compSize; c++) {
            const row = startRow + r
            const col = startCol + c
            const value = values[valueIndex++]

            newGrid[row][col] = {
              value,
              revealed: false,
              isMine: value === maxValue,
              componentId,
            }
          }
        }

        componentId++
      }
    }

    return newGrid
  }

  // Initialize game
  const initializeGame = () => {
    const size = Number.parseInt(inputSize) || 9
    if (size < 4) {
      setInputSize("4")
      setGridSize(4)
      setMessage("Minimum grid size is 4x4")
    } else if (size > 25) {
      setInputSize("25")
      setGridSize(25)
      setMessage("Maximum grid size is 25x25")
    } else {
      setGridSize(size)
    }

    const newGrid = generateSolvedGrid(gridSize)
    setGrid(newGrid)
    setGameOver(false)
    setGameWon(false)
  }

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameOver || gameWon || grid[row][col].revealed) return

    const newGrid = [...grid.map((r) => [...r])]
    const cell = newGrid[row][col]

    // Reveal the cell
    cell.revealed = true

    // Check if it's a mine
    if (cell.isMine) {
      setGameOver(true)

      // Reveal all mines
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (newGrid[r][c].isMine) {
            newGrid[r][c].revealed = true
          }
        }
      }

      setMessage("Game Over! You clicked on a mine.")
    } else {
      // Check if all non-mine cells are revealed (win condition)
      let allNonMinesRevealed = true
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (!newGrid[r][c].isMine && !newGrid[r][c].revealed) {
            allNonMinesRevealed = false
            break
          }
        }
        if (!allNonMinesRevealed) break
      }

      if (allNonMinesRevealed) {
        setGameWon(true)
        setMessage("Congratulations! You've won!")
      }
    }

    setGrid(newGrid)
  }

  // Initialize on component mount
  useEffect(() => {
    initializeGame()
  }, [])

  // Handle grid size change
  const handleSizeChange = () => {
    initializeGame()
  }

  return (
    <div className="flex flex-col items-center max-w-4xl w-full">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
        <div className="flex items-center gap-2">
          <label htmlFor="grid-size" className="whitespace-nowrap">
            Grid Size:
          </label>
          <Input
            id="grid-size"
            type="number"
            min="4"
            max="25"
            value={inputSize}
            onChange={(e) => setInputSize(e.target.value)}
            className="w-20 bg-gray-800 text-white"
          />
        </div>
        <Button onClick={handleSizeChange} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          New Game
        </Button>
      </div>

      {message && (
        <Alert className="mb-4 bg-gray-800 border-gray-700">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div
        className="grid gap-[1px] bg-gray-600 p-[1px]"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          maxWidth: `${Math.min(600, gridSize * 50)}px`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // Determine border styles for component boundaries
            const borderTop =
              Math.floor(rowIndex / componentSize) !== Math.floor((rowIndex - 1) / componentSize) ? "border-t-2" : ""
            const borderLeft =
              Math.floor(colIndex / componentSize) !== Math.floor((colIndex - 1) / componentSize) ? "border-l-2" : ""
            const borderRight = colIndex === gridSize - 1 ? "border-r-2" : ""
            const borderBottom = rowIndex === gridSize - 1 ? "border-b-2" : ""

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  flex items-center justify-center aspect-square
                  ${
                    cell.revealed
                      ? cell.isMine
                        ? "bg-red-900 text-white font-bold"
                        : "bg-gray-700 text-gray-200"
                      : "bg-gray-800 cursor-pointer hover:bg-gray-700"
                  }
                  ${borderTop} ${borderLeft} ${borderRight} ${borderBottom}
                  border-gray-500 text-sm sm:text-base
                `}
                style={{
                  minWidth: "24px",
                  minHeight: "24px",
                  maxWidth: "50px",
                  maxHeight: "50px",
                }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell.revealed ? cell.value : ""}
              </div>
            )
          }),
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-300">
          Click to reveal cells. The highest number in each {componentSize}x{componentSize} component is a mine!
        </p>
      </div>
    </div>
  )
}

